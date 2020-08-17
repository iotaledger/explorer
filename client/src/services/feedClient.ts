import SocketIOClient from "socket.io-client";
import { TrytesHelper } from "../helpers/trytesHelper";
import { IFeedSubscribeRequest } from "../models/api/IFeedSubscribeRequest";
import { IFeedSubscribeResponse } from "../models/api/IFeedSubscribeResponse";
import { IFeedSubscriptionMessage } from "../models/api/IFeedSubscriptionMessage";
import { IFeedUnsubscribeRequest } from "../models/api/IFeedUnsubscribeRequest";

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
     * The web socket to communicate on.
     */
    private readonly _socket: SocketIOClient.Socket;

    /**
     * The latest transactions.
     */
    private _transactions: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number;
    }[];

    /**
     * The tps.
     */
    private _tps: number[];

    /**
     * The tps start.
     */
    private _tpsStart: number;

    /**
     * The tps start.
     */
    private _tpsEnd: number;

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

        // Use websocket by default
        // eslint-disable-next-line new-cap
        this._socket = SocketIOClient(this._endpoint, { upgrade: false, transports: ["websocket"] });

        // If reconnect fails then also try polling mode.
        this._socket.on("reconnect_attempt", () => {
            this._socket.io.opts.transports = ["polling", "websocket"];
        });

        this._transactions = [];
        this._tps = [];
        this._tpsStart = 0;
        this._tpsEnd = 0;
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
                        this._tps = transactionsResponse.tps;
                        this._tpsStart = transactionsResponse.tpsStart;
                        this._tpsEnd = transactionsResponse.tpsEnd;

                        const newHashes = transactionsResponse.transactions;
                        if (newHashes) {
                            const newHashKeys = Object.keys(newHashes);
                            for (const newHashKey of newHashKeys) {
                                if (this._transactions.findIndex(t => t.hash === newHashKey) === -1) {
                                    this._transactions.unshift({
                                        hash: newHashKey,
                                        value: newHashes[newHashKey]
                                    });
                                }
                            }

                            let removeItems: {
                                hash: string;
                                value: number;
                            }[] = [];

                            const zero = this._transactions.filter(t => t.value === 0);
                            const zeroToRemoveCount = zero.length - 100;
                            if (zeroToRemoveCount > 0) {
                                removeItems = removeItems.concat(zero.slice(-zeroToRemoveCount));
                            }
                            const nonZero = this._transactions.filter(t => t.value !== 0);
                            const nonZeroToRemoveCount = nonZero.length - 100;
                            if (nonZeroToRemoveCount > 0) {
                                removeItems = removeItems.concat(nonZero.slice(-nonZeroToRemoveCount));
                            }

                            this._transactions = this._transactions.filter(t => !removeItems.includes(t));
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
     * Get the transactions as trytes.
     * @returns The trytes.
     */
    public getTransactions(): {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number;
    }[] {
        return this._transactions;
    }

    /**
     * Get the tps history array.
     * @returns The tps.
     */
    public getTpsHistory(): number[] {
        return this._tps;
    }

    /**
     * Calculate the tps.
     * @returns The tps.
     */
    public getTps(): number {
        const tps = this._tps;
        if (tps && tps.length > 0) {
            const spanS = (this._tpsEnd - this._tpsStart) / 1000;
            if (spanS > 0) {
                const total = tps.reduce((a, b) => a + b, 0);
                return total / spanS;
            }
        }
        return -1;
    }
}
