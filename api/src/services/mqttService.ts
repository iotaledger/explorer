import { IAddressOutputs, IMessageMetadata, IMilestone, IOutput } from "@iota/iota2.js";
import * as mqtt from "mqtt";
import { v4 } from "uuid";

/**
 * Class to handle MQTT service.
 */
export class MqttService {
    /**
     * The configuration for the service.
     */
    private readonly _endpoint: string;

    /**
     * The events to subscribe to.
     */
    private readonly _events: string[];

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
     * The connected client.
     */
    private _client?: mqtt.MqttClient;

    /**
     * Last time a message was received.
     */
    private _lastMessageTime: number;

    /**
     * Create a new instance of MqttService.
     * @param endpoint The gateway for the service.
     * @param events The events to subscribe to.
     */
    constructor(endpoint: string, events: string[]) {
        this._endpoint = endpoint;
        this._events = events;
        this._lastMessageTime = 0;

        this._subscriptions = {};

        setInterval(() => this.keepAlive(), 15000);
    }

    /**
     * Connect the service.
     */
    public connect(): void {
        try {
            if (!this._client) {
                console.log("MQTT::Connect", this._endpoint);
                this._client = mqtt.connect(this._endpoint);

                this._client.on("connect", () => {
                    this._lastMessageTime = Date.now();
                    for (const topic of this._events) {
                        if (topic) {
                            this._client.subscribe(topic);
                        }
                    }
                });

                this._client.on("message", async (topic, message) => {
                    try {
                        this._lastMessageTime = Date.now();
                        await this.handleMessage(topic, message);
                    } catch (err) {
                        console.error("MQTT::message", err);
                    }
                });
            }
        } catch (err) {
            console.error("MQTT::Connect Error", err);
            this.disconnect();
        }
    }

    /**
     * Disconnect the service.
     */
    public disconnect(): void {
        const localClient = this._client;
        this._client = undefined;
        if (localClient) {
            try {
                console.log("MQTT::Disconnect", this._endpoint);

                for (const event of this._events) {
                    localClient.unsubscribe(event);
                }

                localClient.end();
            } catch {
            }
        }
    }

    /**
     * Subscribe to an address event.
     * @param addressId The address id to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribeAddressOutputs(addressId: string,
        callback: (eventName: string, data: IAddressOutputs) => Promise<void>): string {
        return this.internalAddEventCallback(`addresses/${addressId}/outputs`, callback);
    }

    /**
     * Subscribe to an output event.
     * @param outputId The output id to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribeOutput(outputId: string,
        callback: (eventName: string, data: IOutput) => Promise<void>): string {
        return this.internalAddEventCallback(`outputs/${outputId}`, callback);
    }

    /**
     * Subscribe to a message metadata event.
     * @param messageId The message id to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribeMessageMetadata(messageId: string,
        callback: (eventName: string, data: IMessageMetadata) => Promise<void>): string {
        return this.internalAddEventCallback(`messages/${messageId}/metadata`, callback);
    }

    /**
     * Subscribe to latest milestones event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(
        event: "milestones/latest" | "milestones/solid",
        callback: (eventName: string, data: IMilestone) => Promise<void>): string;

    /**
     * Subscribe to named event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(
        event: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (eventName: string, data: any) => Promise<void>
    ): string {
        return this.internalAddEventCallback(event, callback);
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
     * @param topic The message topic.
     * @param message The message to handle.
     */
    public async handleMessage(topic: string, message: Buffer): Promise<void> {
        const json = message.toString();

        this._lastMessageTime = Date.now();

        if (this._subscriptions[topic]) {
            let data;

            // eslint-disable-next-line default-case
            switch (topic) {
                case "milestones/latest":
                case "milestones/solid": {
                    data = JSON.parse(json) as IMilestone;
                    break;
                }

                default: {
                    if (topic.startsWith("outputs")) {
                        data = JSON.parse(json) as IOutput;
                    } else if (topic.startsWith("addresses")) {
                        data = JSON.parse(json) as IAddressOutputs;
                    } else if (topic.startsWith("messages")) {
                        data = JSON.parse(json) as IMessageMetadata;
                    }
                    break;
                }
            }

            if (data) {
                for (let i = 0; i < this._subscriptions[topic].length; i++) {
                    try {
                        await this._subscriptions[topic][i].callback(topic, data);
                    } catch (err) {
                        console.error("MQTT::Callback Error", topic, data, err);
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
            console.log("MQTT::KeepAlive");
            this.disconnect();
            this.connect();
        }
    }
}
