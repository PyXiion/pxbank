import ServerWorker from '../workers/connection.worker.ts?sharedworker'

export interface ProtocolMessage {
    type?: string;
    data?: any;
    id?: string;
}

export interface ServerProtocolMessage extends ProtocolMessage {
    status: 'ok' | 'error';
    error?: string;
}

interface ResolveReject {
    resolve: (data: any) => void;
    reject: (e: any) => void;
}

export class ProtocolError extends Error {
    data: any

    constructor(msg: string, data: any = undefined) {
        super(msg);
        this.data = data
    }
}

export class TimeoutError extends ProtocolError {
    constructor() {
        super("Timeout");
    }
}


type Event = 'proto-reconnect' | string;

export class PxProtocol {
    private readonly socketWorker = new ServerWorker();
    private nextId: number = 0;

    private idCallbacks = new Map<string, ResolveReject>();
    private typeCallbacks = new Map<string, Set<(data: any) => void>>();

    constructor() {
        this.socketWorker.port.start();
        this.socketWorker.port.onmessage = (e) => {
            this.onMessage(e.data);
        };
    }

    private clear() {
        this.idCallbacks.clear();
        this.typeCallbacks.clear();
    }

    private onMessage(msg: ServerProtocolMessage) {
        // By D
        if (msg.id && this.idCallbacks.has(msg.id)) {
            if (msg.status === 'ok') {
                this.idCallbacks.get(msg.id)!.resolve(msg.data);
            } else if (msg.status === 'error') {
                this.idCallbacks.get(msg.id)!.reject(new ProtocolError(msg.error!, msg?.data));
            }
            this.idCallbacks.delete(msg.id);
        }
        // Subscribers by type
        else if (msg.type && this.typeCallbacks.has(msg.type)) {
            this.typeCallbacks.get(msg.type)!.forEach(callback => {
                try {
                    callback(msg)
                } catch (e) {
                    console.error('Listeting error', e);
                }
            });
        } else {
            console.warn(`Can't process the message`, msg);
        }
    }

    public send(type: string, data: any = null, timeout: number = 5000) {
        if (!this.socketWorker) {
            throw new Error('WebSocket is not open');
        }

        const id = (this.nextId++).toString();

        const message: ProtocolMessage = {
            type, id
        };

        if (data) {
            message.data = data;
        }

        return new Promise<any>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.idCallbacks.delete(id);
                reject(new TimeoutError());
            }, timeout);

            this.idCallbacks.set(id, {
                'resolve': (data) => {
                    clearTimeout(timer);
                    resolve(data);
                },
                'reject': (e) => {
                    clearTimeout(timer);
                    reject(e);
                }
            });

            try {
                this.socketWorker!.port.postMessage(message);
            } catch (err) {
                clearTimeout(timer);
                this.idCallbacks.delete(id);
                reject(err);
            }
        });
    }

    public addEventListener(eventType: Event, callback: (data: ProtocolMessage) => void) {
        if (!this.typeCallbacks.has(eventType)) {
            this.typeCallbacks.set(eventType, new Set());
        }
        this.typeCallbacks.get(eventType)!.add(callback);
    }

    public removeEventListener(eventType: Event, callback: (data: ProtocolMessage) => void) {
        if (this.typeCallbacks.has(eventType)) {
            this.typeCallbacks.get(eventType)!.delete(callback);
            if (this.typeCallbacks.get(eventType)!.size === 0) {
                this.typeCallbacks.delete(eventType);
            }
        }
    }

}
