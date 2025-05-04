import { WEBSOCKET_ADDRESS } from "../config/server.ts";

// Simple in-memory cache with TTL
interface CacheEntry {
    data: any;
    expiresAt: number;
}
class Cache {
    private store = new Map<string, CacheEntry>();

    get(key: string): any | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.data;
    }

    set(key: string, data: any, ttlSeconds: number) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.store.set(key, { data, expiresAt });
    }
}

class BrowserPort {
    public id: string;
    private readonly weakRef: WeakRef<MessagePort>;

    constructor(id: string, port: MessagePort) {
        this.id = id;
        this.weakRef = new WeakRef(port);
        port.start();
    }

    get alive() {
        return !!this.weakRef.deref();
    }

    postMessage(message: unknown) {
        this.weakRef.deref()?.postMessage(message);
    }

    addEventListener<K extends keyof MessagePortEventMap>(type: K, handler: any) {
        this.weakRef.deref()?.addEventListener(type, handler);
    }

    removeEventListener<K extends keyof MessagePortEventMap>(type: K, handler: any) {
        this.weakRef.deref()?.removeEventListener(type, handler);
    }
}

class BrowserPortSet {
    private set = new Set<WeakRef<BrowserPort>>();
    private finalizer = new FinalizationRegistry<WeakRef<BrowserPort>>((held) => {
        this.set.delete(held);
    });

    add(port: BrowserPort) {
        const ref = new WeakRef(port);
        this.set.add(ref);
        this.finalizer.register(port, ref);
    }

    forEach(cb: (port: BrowserPort) => void) {
        this.set.forEach(ref => {
            const port = ref.deref();
            if (port) cb(port);
        });
    }

    broadcast(data: any) {
        this.forEach(port => port.postMessage(data));
    }
}

class Worker {
    private nextId = 0;
    private ports = new BrowserPortSet();
    private socket: WebSocket | null = null;
    private wasClosed = false;
    private pending: any[] = [];
    private cache = new Cache();
    private reqMap = new Map<string, string>(); // compositeId -> requestKey

    constructor() {
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(WEBSOCKET_ADDRESS);

        this.socket.onopen = () => {
            console.log('[SharedWS] WebSocket открыт');
            if (this.wasClosed) this.ports.broadcast({ type: 'proto-reconnect' });
            this.clearPending();
        };

        this.socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            const fullId = data.id;
            // cache response if ttl provided
            if (typeof data.ttl === 'number' && typeof fullId === 'string') {
                const key = this.reqMap.get(fullId);
                if (key) this.cache.set(key, data, data.ttl);
            }

            // route to ports
            let portId: string | null = null;
            let msgId: any = null;
            if (typeof data.id === 'string' && data.id.includes(':')) {
                [portId, msgId] = data.id.split(':');
            } else {
                msgId = data.id;
            }
            data.id = msgId;

            if (portId) {
                this.ports.forEach(p => { if (p.id === portId) p.postMessage(data); });
            } else {
                this.ports.broadcast(data);
            }
        };

        this.socket.onclose = () => {
            this.ports.broadcast({ type: 'toast', data: { type: 'error', summary: 'Потеряно соединение', details: 'Пытаюсь переподключиться...', life: 3000 }});
            this.wasClosed = true;
            console.log('[SharedWS] Соединение потеряно, переподключение...');
            setTimeout(() => this.connect(), 3000);
        };

        this.socket.onerror = (e) => console.error('[SharedWS] Ошибка WebSocket', e);
    }

    public onConnect(event: MessageEvent) {
        console.log('[SharedWS] New connection');
        const port = new BrowserPort((this.nextId++).toString(), event.ports[0]);
        this.ports.add(port);

        port.addEventListener('message', (ev: MessageEvent) => {
            const req = ev.data;
            if (typeof req.id !== 'undefined') {
                const originalKey = JSON.stringify(req);
                const compId = `${port.id}:${req.id}`;
                // check cache
                const cached = this.cache.get(originalKey);
                if (cached) {
                    port.postMessage(cached);
                    return;
                }
                // map composite id to request key for caching on response
                this.reqMap.set(compId, originalKey);
                req.id = compId;
            }

            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(req));
            } else {
                console.warn('[SharedWS] Сокет закрыт, очередь сообщений:', req);
                this.pending.push(req);
            }
        });
    }

    private clearPending() {
        if (!this.socket) return;
        this.pending.forEach(d => this.socket!.send(JSON.stringify(d)));
        this.pending = [];
    }
}

const worker = new Worker();
const self_ = self as any;
self_.onconnect = worker.onConnect.bind(worker);
