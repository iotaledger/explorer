import { Subscriber } from "zeromq";

/**
 * Class to handle ZMQ service.
 */
export class ZmqMessageService {
    /**
     * The configuration for the service.
     */
    private readonly _endpoint: string;

    /**
     * The network the service is on.
     */
    private readonly _network: string;

    /**
     * The events to subscribe to.
     */
    private readonly _events: string[];

    /**
     * Is this a master thread.
     */
    private readonly _masterCallback?: (network: string, message: string) => Promise<void>;

    /**
     * The connected socket.
     */
    private _socket?: Subscriber;

    /**
     * Last time a message was received.
     */
    private _lastMessageTime: number;

    /**
     * Create a new instance of ZmqService.
     * @param endpoint The gateway for the zmq service.
     * @param network The network the service is on.
     * @param events The events to subscribe to.
     * @param masterCallback Is this a master thread.
     */
    constructor(endpoint: string,
        network: string,
        events: string[],
        masterCallback: (network: string, message: string) => Promise<void>) {
        this._endpoint = endpoint;
        this._events = events;
        this._lastMessageTime = 0;
        this._masterCallback = masterCallback;
        this._network = network;

        setInterval(() => this.keepAlive(), 15000);
    }

    /**
     * Connect the ZMQ service.
     */
    public connect(): void {
        try {
            if (!this._socket) {
                this._socket = new Subscriber();
                this._socket.connect(this._endpoint);

                for (const event of this._events) {
                    this._socket.subscribe(event);
                }

                this._lastMessageTime = Date.now();

                // Run this as a background task otherwise
                // it will block this method
                setTimeout(
                    async () => {
                        try {
                            this._lastMessageTime = Date.now();
                            for await (const [msg] of this._socket) {
                                await this._masterCallback(this._network, msg.toString());
                            }
                        } catch (err) {
                            console.error("ZMQ Listening", err);
                        }
                    },
                    500);
            }
        } catch (err) {
            console.error("ZMQ Connecting", err);
            this.disconnect();
        }
    }

    /**
     * Disconnect the ZMQ service.
     */
    public disconnect(): void {
        const localSocket = this._socket;
        this._socket = undefined;
        if (localSocket) {
            try {
                for (const event of this._events) {
                    localSocket.unsubscribe(event);
                }

                localSocket.close();
            } catch {
            }
        }
    }

    /**
     * Keep the connection alive.
     */
    private keepAlive(): void {
        if (Date.now() - this._lastMessageTime > 15000) {
            this.disconnect();
            this.connect();
        }
    }
}
