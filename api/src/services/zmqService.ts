import { Subscriber } from "zeromq";
import { IAddress } from "../models/zmq/IAddress";
import { IAntn } from "../models/zmq/IAntn";
import { IDnscc } from "../models/zmq/IDnscc";
import { IDnscu } from "../models/zmq/IDnscu";
import { IDnscv } from "../models/zmq/IDnscv";
import { IHmr } from "../models/zmq/IHmr";
import { ILmhs } from "../models/zmq/ILmhs";
import { ILmi } from "../models/zmq/ILmi";
import { ILmsi } from "../models/zmq/ILmsi";
import { IMctn } from "../models/zmq/IMctn";
import { IRntn } from "../models/zmq/IRntn";
import { IRstat } from "../models/zmq/IRstat";
import { IRtl } from "../models/zmq/IRtl";
import { ISn } from "../models/zmq/ISn";
import { ITx } from "../models/zmq/ITx";
import { ITxTrytes } from "../models/zmq/ITxTrytes";
import { ZmqEvent } from "../models/zmq/zmqEvents";
import { TrytesHelper } from "../utils/trytesHelper";

/**
 * Class to handle ZMQ service.
 */
export class ZmqService {
    /**
     * The configuration for the service.
     */
    private readonly _endpoint: string;

    /**
     * The connected socket.
     */
    private _socket?: Subscriber;

    /**
     * Avoid interlock when connecting.
     */
    private _connecting: boolean;

    /**
     * Last time a message was received.
     */
    private _lastMessageTime: number;

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
            callback(event: string, data: any): Promise<void>;
        }[];
    };

    /**
     * Create a new instance of ZmqService.
     * @param endpoint The gateway for the zmq service.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
        this._subscriptions = {};
        this._lastMessageTime = 0;
        this._connecting = false;

        setInterval(() => this.keepAlive(), 5000);
    }

    /**
     * Subscribe to antn event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "antn", callback: (event: string, data: IAntn) => Promise<void>): Promise<string>;
    /**
     * Subscribe to dnscc event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "dnscc", callback: (event: string, data: IDnscc) => Promise<void>): Promise<string>;
    /**
     * Subscribe to dnscu event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "dnscu", callback: (event: string, data: IDnscu) => Promise<void>): Promise<string>;
    /**
     * Subscribe to dnscv event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "dnscv", callback: (event: string, data: IDnscv) => Promise<void>): Promise<string>;
    /**
     * Subscribe to hmr event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "hmr", callback: (event: string, data: IHmr) => Promise<void>): Promise<string>;
    /**
     * Subscribe to lmhs event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "lmhs", callback: (event: string, data: ILmhs) => Promise<void>): Promise<string>;
    /**
     * Subscribe to lmi event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "lmi", callback: (event: string, data: ILmi) => Promise<void>): Promise<string>;
    /**
     * Subscribe to lmsi event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "lmsi", callback: (event: string, data: ILmsi) => Promise<void>): Promise<string>;
    /**
     * Subscribe to mctn event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "mctn", callback: (event: string, data: IMctn) => Promise<void>): Promise<string>;
    /**
     * Subscribe to rntn event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "rntn", callback: (event: string, data: IRntn) => Promise<void>): Promise<string>;
    /**
     * Subscribe to rstat event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "rstat", callback: (event: string, data: IRstat) => Promise<void>): Promise<string>;
    /**
     * Subscribe to rtl event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "rtl", callback: (event: string, data: IRtl) => Promise<void>): Promise<string>;
    /**
     * Subscribe to sn event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "sn", callback: (event: string, data: ISn) => Promise<void>): Promise<string>;
    /**
     * Subscribe to tx event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "tx", callback: (event: string, data: ITx) => Promise<void>): Promise<string>;
    /**
     * Subscribe to tx_trytes event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: "tx_trytes" | "trytes", callback: (event: string, data: ITxTrytes) => Promise<void>):
        Promise<string>;
    /**
     * Subscribe to named event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribe(event: ZmqEvent, callback: (event: string, data: any) => Promise<void>):
        Promise<string> {
        return this.internalAddEventCallback(event, callback);
    }

    /**
     * Subscribe to a specific event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public async subscribeEvent(event: ZmqEvent, callback: (event: string, data: any) => Promise<void>)
        : Promise<string> {
        return this.internalAddEventCallback(event, callback);
    }

    /**
     * Subscribe to address messages.
     * @param address The address to watch.
     * @param callback Callback to call with address data.
     * @returns An id to use for unsubscribe.
     */
    public async subscribeAddress(address: string, callback: (event: string, data: IAddress) => Promise<void>)
        : Promise<string> {
        if (!/^[A-Z9]{81}$/.test(address)) {
            throw new Error(`The parameter 'address' must be 81 trytes.`);
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
                        if (this._socket) {
                            console.log("Unsubscribe", keys[i], this._endpoint);
                            this._socket.unsubscribe(eventKey);
                        }

                        delete this._subscriptions[eventKey];

                        if (Object.keys(this._subscriptions).length === 0) {
                            this.disconnect();
                        }
                    }
                    return;
                }
            }
        }
    }

    /**
     * Connect the ZMQ service.
     */
    private async connect(): Promise<void> {
        try {
            if (!this._connecting && !this._socket) {
                this._connecting = true;

                const localSocket = new Subscriber();
                localSocket.connect(this._endpoint);

                console.log("Connect", this._endpoint);

                const keys = Object.keys(this._subscriptions);
                for (let i = 0; i < keys.length; i++) {
                    console.log("Subscribe", keys[i], this._endpoint);
                    localSocket.subscribe(keys[i]);
                }

                this._socket = localSocket;
                this._lastMessageTime = Date.now();
                this._connecting = false;

                // Run this as a background task otherwise
                // it will block this method
                setTimeout(
                    async () => {
                        // tslint:disable-next-line: await-promise
                        for await (const [msg] of this._socket) {
                            await this.handleMessage(msg);
                        }
                    },
                    500);
            }
        } catch (err) {
            this._socket = undefined;
            this._connecting = false;

            console.log("ZMQ Connect Failed", err);
        }
    }

    /**
     * Disconnect the ZQM service.
     */
    private disconnect(): void {
        const localSocket = this._socket;
        this._socket = undefined;
        if (localSocket) {
            try {
                const keys = Object.keys(this._subscriptions);
                for (let i = 0; i < keys.length; i++) {
                    console.log("Unsubscribe", keys[i], this._endpoint);
                    localSocket.unsubscribe(keys[i]);
                }

                console.log("Close", this._endpoint);
                localSocket.close();
            } catch (err) {
                console.log("Error on close", err, this._endpoint);
            }
        }
    }

    /**
     * Keep the connection alive.
     */
    private async keepAlive(): Promise<void> {
        if (!this._connecting) {
            if (Object.keys(this._subscriptions).length > 0) {
                if (Date.now() - this._lastMessageTime > 15000) {
                    console.log("Idle disconnect", this._endpoint);
                    this._lastMessageTime = Date.now();
                    this.disconnect();
                    await this.connect();
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
    private async internalAddEventCallback(event: string, callback: (event: string, data: any) => Promise<void>)
        : Promise<string> {
        if (!this._subscriptions[event]) {
            this._subscriptions[event] = [];
            if (this._socket) {
                console.log("Subscribe", event, this._endpoint);
                this._socket.subscribe(event);
            }
        }
        const id = TrytesHelper.generateHash(27);
        this._subscriptions[event].push({ id, callback });

        await this.connect();

        return id;
    }

    /**
     * Handle a message and send to any callbacks.
     * @param message The message to handle.
     */
    private async handleMessage(message: Buffer): Promise<void> {
        const messageContent = message.toString();
        const messageParams = messageContent.split(" ");

        this._lastMessageTime = Date.now();

        const event = messageParams[0];

        if (this._subscriptions[event]) {
            let data;

            switch (event) {
                case "antn": {
                    data = <IAntn>{
                        url: messageParams[1]
                    };
                    break;
                }

                case "dnscc": {
                    data = <IDnscc>{
                        neighborsHostname: messageParams[1]
                    };
                    break;
                }

                case "dnscu": {
                    data = <IDnscu>{
                        neighborsHostname: messageParams[1]
                    };
                    break;
                }

                case "dnscv": {
                    data = <IDnscv>{
                        neighborsHostname: messageParams[1],
                        neighborsIPAddress: messageParams[2]
                    };
                    break;
                }

                case "hmr": {
                    const parts = messageParams[1].split("/");
                    data = <IHmr>{
                        hitCount: parseInt(parts[0], 10),
                        missCount: parseInt(parts[1], 10)
                    };
                    break;
                }

                case "lmhs": {
                    data = <ILmhs>{
                        latestMilestoneHash: messageParams[1]
                    };
                    break;
                }

                case "lmi": {
                    data = <ILmi>{
                        previousIndex: parseInt(messageParams[1], 10),
                        latestIndex: parseInt(messageParams[2], 10)
                    };
                    break;
                }

                case "lmsi": {
                    data = <ILmsi>{
                        prevSolidMilestoneIndex: parseInt(messageParams[1], 10),
                        latestMilestoneIndex: parseInt(messageParams[2], 10)
                    };
                    break;
                }

                case "mctn": {
                    data = <IMctn>{
                        totalTransactions: parseInt(messageParams[1], 10)
                    };
                    break;
                }

                case "rntn": {
                    data = <IRntn>{
                        url: messageParams[1],
                        maxPeers: parseInt(messageParams[2], 10)
                    };
                    break;
                }

                case "rstat": {
                    data = <IRstat>{
                        received: parseInt(messageParams[1], 10),
                        toBroadcast: parseInt(messageParams[2], 10),
                        notRequested: parseInt(messageParams[3], 10),
                        notSent: parseInt(messageParams[4], 10),
                        stored: parseInt(messageParams[5], 10)
                    };
                    break;
                }

                case "rtl": {
                    data = <IRtl>{
                        hash: messageParams[1]
                    };
                    break;
                }

                case "sn": {
                    data = <ISn>{
                        index: parseInt(messageParams[1], 10),
                        transaction: messageParams[2],
                        address: messageParams[3],
                        trunk: messageParams[4],
                        branch: messageParams[5],
                        bundle: messageParams[6]
                    };
                    break;
                }

                case "tx": {
                    data = <ITx>{
                        hash: messageParams[1],
                        address: messageParams[2],
                        value: parseInt(messageParams[3], 10),
                        obsoleteTag: messageParams[4],
                        timestamp: parseInt(messageParams[5], 10),
                        currentIndex: parseInt(messageParams[6], 10),
                        lastIndex: parseInt(messageParams[7], 10),
                        bundle: messageParams[8],
                        trunk: messageParams[9],
                        branch: messageParams[10],
                        attachmentTimestamp: parseInt(messageParams[11], 10),
                        tag: messageParams[12]
                    };
                    break;
                }

                case "tx_trytes":
                case "trytes": {
                    data = <ITxTrytes>{
                        trytes: messageParams[1],
                        hash: messageParams[2]
                    };
                    break;
                }

                default: {
                    // Is this an address event
                    if (/^[A-Z9]{81}$/.test(event)) {
                        data = <IAddress>{
                            address: messageParams[0],
                            transaction: messageParams[1],
                            milestoneIndex: parseInt(messageParams[2], 10)
                        };
                    }
                }
            }

            for (let i = 0; i < this._subscriptions[event].length; i++) {
                try {
                    await this._subscriptions[event][i].callback(event, data);
                } catch (err) {
                    console.error(`Exceptionin ZMQ callback`, event, data, err);
                }
            }
        }
    }
}
