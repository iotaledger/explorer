import SocketIOClient from "socket.io-client";
import { ServiceFactory } from "../factories/serviceFactory";
import { TrytesHelper } from "../helpers/trytesHelper";
import { IFeedSubscribeRequest } from "../models/api/IFeedSubscribeRequest";
import { IFeedSubscribeResponse } from "../models/api/IFeedSubscribeResponse";
import { IFeedUnsubscribeRequest } from "../models/api/IFeedUnsubscribeRequest";
import { IFeedItemChrysalis } from "../models/api/og/IFeedItemChrysalis";
import { IFeedItemOg } from "../models/api/og/IFeedItemOg";
import { IFeedSubscriptionMessage } from "../models/api/og/IFeedSubscriptionMessage";
import { INetwork } from "../models/db/INetwork";
import { NetworkService } from "./networkService";

/**
 * Class to handle api communications.
 */
export class FeedClient {
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
    private _items: (IFeedItemOg | IFeedItemChrysalis)[];

    /**
     * Existing ids.
     */
    private _existingIds: string[];

    /**
     * The confirmed items.
     */
    private _confirmedIds: string[];

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
    private readonly _subscribers: { [id: string]: () => void };

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
        this._confirmedIds = [];
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
    public subscribe(callback: () => void): string {
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
                this._socket.on("transactions", async (transactionsResponse: IFeedSubscriptionMessage) => {
                    if (transactionsResponse.subscriptionId === this._subscriptionId) {
                        this._ips = transactionsResponse.ips;
                        this._confirmedIds = transactionsResponse.confirmed;

                        if (transactionsResponse.items) {
                            this._items = transactionsResponse.items
                                .filter(nh => !this._existingIds.includes(nh.id))
                                .concat(this._items);

                            let removeItems: {
                                id: string;
                                value: number;
                            }[] = [];

                            const zero = this._items.filter(t => t.value === 0);
                            const zeroToRemoveCount = zero.length - 100;
                            if (zeroToRemoveCount > 0) {
                                removeItems = removeItems.concat(zero.slice(-zeroToRemoveCount));
                            }
                            const nonZero = this._items.filter(t => t.value !== 0);
                            const nonZeroToRemoveCount = nonZero.length - 100;
                            if (nonZeroToRemoveCount > 0) {
                                removeItems = removeItems.concat(nonZero.slice(-nonZeroToRemoveCount));
                            }

                            this._items = this._items.filter(t => !removeItems.includes(t));
                            this._existingIds = this._items.map(t => t.id);
                        }

                        for (const sub in this._subscribers) {
                            this._subscribers[sub]();
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
    public getItems(): (IFeedItemOg | IFeedItemChrysalis)[] {
        return this._items.slice();
    }

    /**
     * Get the confirmed ids.
     * @returns The hahes.
     */
    public getConfirmedIds(): string[] {
        return this._confirmedIds;
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
}
