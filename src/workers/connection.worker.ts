import {WEBSOCKET_ADDRESS} from "../config/server.ts";


class BrowserPort {
    public id: string
    private readonly weakRef: WeakRef<MessagePort>;

    public constructor(id: string, port: MessagePort) {
        this.id = id
        this.weakRef = new WeakRef(port);
        port.start();
    }

    public get alive() {
        return !!this.weakRef.deref();
    }

    public postMessage(message: unknown) {
        this.weakRef.deref()?.postMessage(message);
    }

    public addEventListener<K extends keyof MessagePortEventMap>(type: K, handler: any) {
        this.weakRef.deref()?.addEventListener(type, handler);
    }

    public removeEventListener<K extends keyof MessagePortEventMap>(type: K, handler: any) {
        this.weakRef.deref()?.removeEventListener(type, handler);
    }
}

class BrowserPortSet {
    private set: Set<WeakRef<BrowserPort>> = new Set();
    private finalizer = new FinalizationRegistry(this.onPortRelease.bind(this));

    private onPortRelease(heldValue: WeakRef<BrowserPort>) {
        this.set.delete(heldValue);
    }

    public add(port: BrowserPort) {
        const weakRef = new WeakRef(port);
        this.set.add(weakRef);
        this.finalizer.register(port, weakRef);
    }

    public forEach(callback: (port: BrowserPort) => void) {
        this.set.forEach(p => {
            const port = p.deref();
            if (port)
                callback(port);
        });
    }

    public broadcast(data: any) {
        this.forEach((port) => port.postMessage(data));
    }
}

class Worker {
    private nextId = 0
    private readonly ports = new BrowserPortSet();
    private socket: WebSocket | null = null;

    private wasClosed = false

    private pending: any[] = [];

    public constructor() {
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(WEBSOCKET_ADDRESS);

        this.socket!.onopen = () => {
            console.log('[SharedWS] WebSocket открыт');

            if (this.wasClosed) {
                this.ports.broadcast({
                    'type': 'proto-reconnect'
                })
            }

            this.clearPending();
        }
        this.socket!.onmessage = (e) => {
            const data = JSON.parse(e.data);
            const [portId, id] = ('id' in data && data.id.includes(':')) ? data.id.split(':') : [null, data.id];
            data.id = id;

            if (portId) {
                this.ports.forEach(p => {
                    if (p.id == portId)
                        p.postMessage(data)
                })
            } else {
                this.ports.broadcast(data);
            }
        }

        this.socket!.onclose = () => {
            this.ports.broadcast({
                'type': 'toast',
                'data': {
                    'type': 'error',
                    'summary': 'Потеряно соединение',
                    'details': 'Пытаюсь переподключиться...',
                    'life': 3000
                }
            })
            this.wasClosed = true
            console.log('[SharedWS] Соединение потеряно, переподключение...');
            setTimeout(this.connect.bind(this), 3000);
        }

        this.socket!.onerror = (e) => {
            console.error('[SharedWS] Ошибка WebSocket', JSON.stringify(e));
        }
    }

    public onConnect(event: MessageEvent) {
        console.log('[SharedWS] New connection')
        const port = new BrowserPort((this.nextId++).toString(), event.ports[0]);
        this.ports.add(port);

        port.addEventListener('message', (event: MessageEvent) => {
            const data = event.data;
            if ('id' in data) {
                data.id = port.id + ':' + data.id;
            }

            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(data));
            } else {
                console.warn(`[SharedWS] Не удалось отправить сообщение, так как сокет закрыт. Сообщение добавлено в очередь.`);
                this.pending.push(event.data);
            }
        })
    }

    private clearPending() {
        if (!this.socket) return;
        this.pending.forEach(data => this.socket!.send(JSON.stringify(data)));
        this.pending = [];
    }
}

const worker = new Worker();

const self_ = self as any;
self_.onconnect = worker.onConnect.bind(worker);