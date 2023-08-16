import { v4 } from "uuid";
import zmq from "zeromq";
import logger from "../../logger";
import { IAddress } from "../../models/zmq/IAddress";
import { ISn } from "../../models/zmq/ISn";
import { ITxTrytes } from "../../models/zmq/ITxTrytes";
import { ZmqEvent } from "../../models/zmq/zmqEvent";

/**
 * Class to handle ZMQ service.
 */
export class ZmqService {
    /**
     * The configuration for the service.
     */
    private readonly _endpoint: string;

    /**
     * The events to subscribe to.
     */
    private readonly _events: (ZmqEvent | string)[];

    /**
     * The callback for different events.
     */
    private readonly _subscriptions: {
        [event: string]: {
            /**
             * The id of the subscription.
             */
            id: string;
            /**
             * The callback for the subscription.
             * @param event The event for the subscription.
             * @param data The data for the event.
             */
            callback(event: string, data: unknown): Promise<void>;
        }[];
    };

    /**
     * The connected socket.
     */
    private _socket?: zmq.Socket;

    /**
     * Last time a message was received.
     */
    private _lastMessageTime: number;

    /**
     * Create a new instance of ZmqService.
     * @param endpoint The gateway for the zmq service.
     * @param events The events to subscribe to.
     */
    constructor(endpoint: string, events: (ZmqEvent | string)[]) {
        this._endpoint = endpoint;
        this._events = events;
        this._lastMessageTime = 0;

        this._subscriptions = {};

        setInterval(() => this.keepAlive(), 15000);
    }

    /**
     * Connect the ZMQ service.
     */
    public connect(): void {
        try {
            if (!this._socket) {
                logger.verbose("[Zmq] Connect Legacy");
                this._socket = zmq.socket("sub");
                this._socket.connect(this._endpoint);

                this._socket.on("message", async (msg: Buffer) => this.handleMessage(msg.toString()));

                for (const event of this._events) {
                    this._socket.subscribe(event);
                }

                this._lastMessageTime = Date.now();
            }
        } catch (err) {
            logger.error(`[Zmq] Connect Error. Cause: ${err}`);
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
                logger.debug("[Zmq] Disconnect Legacy");

                for (const event of this._events) {
                    localSocket.unsubscribe(event);
                }

                localSocket.close();
            } catch {
            }
        }
    }

    /**
     * Subscribe to sn event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(event: "sn", callback: (eventName: string, data: ISn) => Promise<void>): string;

    /**
     * Subscribe to trytes event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(
        event: "trytes",
        callback: (eventName: string, data: ITxTrytes) => Promise<void>
    ): string;

    /**
     * Subscribe to named event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(
        event: ZmqEvent,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (eventName: string, data: any) => Promise<void>
    ): string {
        return this.internalAddEventCallback(event, callback);
    }

    /**
     * Subscribe to a specific event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribeEvent(
        event: ZmqEvent,
        callback: (eventName: string, data: unknown) => Promise<void>
    ): string {
        return this.internalAddEventCallback(event, callback);
    }

    /**
     * Subscribe to address messages.
     * @param address The address to watch.
     * @param callback Callback to call with address data.
     * @returns An id to use for unsubscribe.
     */
    public subscribeAddress(
        address: string,
        callback: (event: string, data: IAddress) => Promise<void>
    ): string {
        if (!/^[9A-Z]{81}$/.test(address)) {
            throw new Error("The parameter 'address' must be 81 trytes.");
        }

        return this.internalAddEventCallback(address, callback);
    }

    /**
     * Unsubscribe from an event.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribe(subscriptionId: string): void {
        const keys = Object.keys(this._subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const eventKey = keys[i];
            for (let j = 0; j < this._subscriptions[eventKey].length; j++) {
                if (this._subscriptions[eventKey][j].id === subscriptionId) {
                    this._subscriptions[eventKey].splice(j, 1);
                    if (this._subscriptions[eventKey].length === 0) {
                        delete this._subscriptions[eventKey];
                    }
                    return;
                }
            }
        }
    }

    /**
     * Handle a message and send to any callbacks.
     * @param message The message to handle.
     */
    public async handleMessage(message: string): Promise<void> {
        const messageParams = message.split(" ");

        this._lastMessageTime = Date.now();

        const event = messageParams[0];

        if (this._subscriptions[event]) {
            let data;

            switch (event) {
                case "sn": {
                    data = {
                        index: Number.parseInt(messageParams[1], 10),
                        transaction: messageParams[2],
                        address: messageParams[3],
                        trunk: messageParams[4],
                        branch: messageParams[5],
                        bundle: messageParams[6]
                    } as ISn;
                    break;
                }

                case "trytes": {
                    data = {
                        trytes: messageParams[1],
                        txHash: messageParams[2]
                    } as ITxTrytes;
                    break;
                }

                default: {
                    // Is this an address event
                    if (/^[9A-Z]{81}$/.test(event)) {
                        const mi = Number.parseInt(messageParams[2], 10);
                        if (!Number.isNaN(mi)) {
                            data = {
                                address: messageParams[0],
                                transaction: messageParams[1],
                                milestoneIndex: mi
                            } as IAddress;
                        }
                    }
                }
            }

            if (data) {
                for (let i = 0; i < this._subscriptions[event].length; i++) {
                    try {
                        await this._subscriptions[event][i].callback(event, data);
                    } catch (err) {
                        logger.error(`[Zmq] Callback error! Event: ${event}. Data: ${data} Err: ${err}`);
                    }
                }
            }
        }
    }

    /**
     * Add a callback for the event.
     * @param event The event to add the callback for.
     * @param callback The callback to store for the event.
     * @returns The id of the subscription.
     */
    protected internalAddEventCallback(
        event: string,
        callback: (eventName: string, data: unknown) => Promise<void>
    ): string {
        if (!this._subscriptions[event]) {
            this._subscriptions[event] = [];
        }

        const id = v4();

        this._subscriptions[event].push({ id, callback });

        return id;
    }

    /**
     * Keep the connection alive.
     */
    private keepAlive(): void {
        if (Date.now() - this._lastMessageTime > 30000) {
            logger.debug("[Zmq] Legacy keepalive");
            this.disconnect();
            this.connect();
        }
    }
}
