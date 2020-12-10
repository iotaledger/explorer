import { Blake2b, Converter, deserializeMessage, ReadStream } from "@iota/iota.js";
import { asTransactionObject } from "@iota/transaction-converter";
import SocketIOClient from "socket.io-client";
import { ServiceFactory } from "../factories/serviceFactory";
import { TrytesHelper } from "../helpers/trytesHelper";
import { IFeedItemMetadata } from "../models/api/IFeedItemMetadata";
import { IFeedSubscribeRequest } from "../models/api/IFeedSubscribeRequest";
import { IFeedSubscribeResponse } from "../models/api/IFeedSubscribeResponse";
import { IFeedSubscriptionMessage } from "../models/api/IFeedSubscriptionMessage";
import { IFeedUnsubscribeRequest } from "../models/api/IFeedUnsubscribeRequest";
import { INetwork } from "../models/db/INetwork";
import { IFeedItem } from "../models/IFeedItem";
import { NetworkService } from "./networkService";

/**
 * Class to handle api communications.
 */
export class FeedClient {
    /**
     * Minimun number of each item to keep.
     */
    private static readonly MIN_ITEMS_PER_TYPE: number = 50;

    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Network configuration.
     */
    private readonly _networkId: string;

    /**
     * Network configuration.
     */
    private readonly _networkConfig?: INetwork;

    /**
     * The web socket to communicate on.
     */
    private readonly _socket: SocketIOClient.Socket;

    /**
     * The latest items.
     */
    private _items: IFeedItem[];

    /**
     * Existing ids.
     */
    private _existingIds: string[];

    /**
     * The ips.
     */
    private _ips: {
        /**
         * The start timestamp for the ips.
         */
        start: number;

        /**
         * The end timestamp for the ips.
         */
        end: number;

        /**
         * The ips counts.
         */
        itemCount: number[];

        /**
         * The confirmed ips counts.
         */
        confirmedItemCount: number[];
    };

    /**
     * The subscription id.
     */
    private _subscriptionId?: string;

    /**
     * The subscribers.
     */
    private readonly _subscribers: {
        [id: string]: (newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }) => void;
    };

    /**
     * Create a new instance of TransactionsClient.
     * @param endpoint The endpoint for the api.
     * @param networkId The network configurations.
     */
    constructor(endpoint: string, networkId: string) {
        this._endpoint = endpoint;
        this._networkId = networkId;

        const networkService = ServiceFactory.get<NetworkService>("network");
        this._networkConfig = networkService.get(this._networkId);

        // Use websocket by default
        // eslint-disable-next-line new-cap
        this._socket = SocketIOClient(this._endpoint, { upgrade: true, transports: ["websocket"] });

        // If reconnect fails then also try polling mode.
        this._socket.on("reconnect_attempt", () => {
            this._socket.io.opts.transports = ["polling", "websocket"];
        });

        this._items = [];
        this._existingIds = [];
        this._ips = {
            start: 0,
            end: 0,
            itemCount: [],
            confirmedItemCount: []
        };

        this._subscribers = {};
    }

    /**
     * Perform a request to subscribe to transactions events.
     * @param callback Callback called with transactions data.
     * @returns The subscription id.
     */
    public subscribe(callback: (newItems: IFeedItem[], metaData: { [id: string]: IFeedItemMetadata }) => void): string {
        const subscriptionId = TrytesHelper.generateHash(27);
        this._subscribers[subscriptionId] = callback;

        try {
            if (!this._subscriptionId) {
                const subscribeRequest: IFeedSubscribeRequest = {
                    network: this._networkId
                };

                this._socket.emit("subscribe", subscribeRequest);
                this._socket.on("subscribe", (subscribeResponse: IFeedSubscribeResponse) => {
                    if (!subscribeResponse.error) {
                        this._subscriptionId = subscribeResponse.subscriptionId;
                    }
                });
                this._socket.on("transactions", async (subscriptionMessage: IFeedSubscriptionMessage) => {
                    if (subscriptionMessage.subscriptionId === this._subscriptionId) {
                        this._ips = subscriptionMessage.ips;

                        if (subscriptionMessage.itemsMetadata) {
                            for (const metadataId in subscriptionMessage.itemsMetadata) {
                                const existing = this._items.find(c => c.id === metadataId);
                                if (existing) {
                                    existing.metaData = {
                                        ...subscriptionMessage.itemsMetadata[metadataId],
                                        ...existing.metaData
                                    };
                                }
                            }
                        }

                        const filteredNewItems = subscriptionMessage.items
                            .map(item => this.convertItem(item))
                            .filter(nh => !this._existingIds.includes(nh.id));

                        if (filteredNewItems.length > 0) {
                            this._items = filteredNewItems.slice().concat(this._items);

                            let removeItems: IFeedItem[] = [];

                            const transactionPayload = this._items.filter(t => t.payloadType === "Transaction");
                            const transactionPayloadToRemoveCount =
                                transactionPayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (transactionPayloadToRemoveCount > 0) {
                                removeItems =
                                    removeItems.concat(transactionPayload.slice(-transactionPayloadToRemoveCount));
                            }
                            const indexPayload = this._items.filter(t => t.payloadType === "Index");
                            const indexPayloadToRemoveCount = indexPayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (indexPayloadToRemoveCount > 0) {
                                removeItems = removeItems.concat(indexPayload.slice(-indexPayloadToRemoveCount));
                            }
                            const msPayload = this._items.filter(t => t.payloadType === "MS");
                            const msPayloadToRemoveCount = msPayload.length - FeedClient.MIN_ITEMS_PER_TYPE;
                            if (msPayloadToRemoveCount > 0) {
                                removeItems = removeItems.concat(msPayload.slice(-msPayloadToRemoveCount));
                            }

                            this._items = this._items.filter(t => !removeItems.includes(t));

                            this._existingIds = this._items.map(t => t.id);
                        }

                        for (const sub in this._subscribers) {
                            this._subscribers[sub](filteredNewItems, subscriptionMessage.itemsMetadata);
                        }
                    }
                });
            }
        } catch { }

        return subscriptionId;
    }

    /**
     * Perform a request to unsubscribe to transactions events.
     * @param subscriptionId The subscription id.
     */
    public unsubscribe(subscriptionId: string): void {
        try {
            delete this._subscribers[subscriptionId];

            if (this._subscriptionId && Object.keys(this._subscribers).length === 0) {
                const unsubscribeRequest: IFeedUnsubscribeRequest = {
                    network: this._networkId,
                    subscriptionId: this._subscriptionId
                };
                this._socket.emit("unsubscribe", unsubscribeRequest);
                this._socket.on("unsubscribe", () => { });
            }
        } catch {
        } finally {
            this._subscriptionId = undefined;
        }
    }

    /**
     * Get the items.
     * @returns The item details.
     */
    public getItems(): IFeedItem[] {
        return this._items.slice();
    }

    /**
     * Get the items per second history array.
     * @returns The ips.
     */
    public getIpsHistory(): number[] {
        return this._ips.itemCount.slice();
    }

    /**
     * Calculate the ips.
     * @returns The ips.
     */
    public getIitemPerSecond(): {
        /**
         * Items per second.
         */
        itemsPerSecond: number;
        /**
         * Confirmed per second.
         */
        confirmedPerSecond: number;
    } {
        let itemsPerSecond = -1;
        let confirmedPerSecond = -1;

        const ips = this._ips;
        if (ips) {
            const spanS = (this._ips.end - this._ips.start) / 1000;
            if (spanS > 0) {
                if (ips.itemCount.length > 0) {
                    const ipsTotal = ips.itemCount.reduce((a, b) => a + b, 0);
                    itemsPerSecond = ipsTotal / spanS;
                }
                if (ips.confirmedItemCount.length > 0) {
                    const cipsTotal = ips.confirmedItemCount.reduce((a, b) => a + b, 0);
                    confirmedPerSecond = cipsTotal / spanS;
                }
            }
        }
        return {
            itemsPerSecond,
            confirmedPerSecond
        };
    }

    /**
     * Convert the feed item into real data.
     * @param item The item source.
     * @returns The feed item.
     */
    private convertItem(item: string): IFeedItem {
        if (this._networkConfig?.protocolVersion === "chrysalis") {
            const bytes = Converter.hexToBytes(item);
            const messageId = Converter.bytesToHex(Blake2b.sum256(bytes));

            let value;
            let payloadType: "Transaction" | "Index" | "MS" | "None" = "None";
            const properties: { [key: string]: unknown } = {};
            let message;

            try {
                message = deserializeMessage(new ReadStream(bytes));

                if (message.payload?.type === 0) {
                    payloadType = "Transaction";
                    value = message.payload.essence.outputs.reduce((total, output) => total + output.amount, 0);

                    if (message.payload.essence.payload) {
                        properties.Index = message.payload.essence.payload.index;
                    }
                } else if (message.payload?.type === 1) {
                    payloadType = "MS";
                    properties.MS = message.payload.index;
                } else if (message.payload?.type === 2) {
                    payloadType = "Index";
                    properties.Index = message.payload.index;
                }
            } catch (err) {
                console.error(err);
            }

            return {
                id: messageId,
                value,
                parent1: message?.parent1MessageId ?? "",
                parent2: message?.parent2MessageId ?? "",
                properties,
                payloadType
            };
        }

        const tx = asTransactionObject(item);

        return {
            id: tx.hash,
            value: tx.value,
            parent1: tx.trunkTransaction,
            parent2: tx.branchTransaction,
            properties: {
                "Tag": tx.tag,
                "Address": tx.address,
                "Bundle": tx.bundle
            },
            payloadType: "Transaction"
        };
    }
}
