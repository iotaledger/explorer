import SocketIOClient from "socket.io-client";
import { TrytesHelper } from "../helpers/trytesHelper";
import { ITransactionsSubscribeRequest } from "../models/api/ITransactionsSubscribeRequest";
import { ITransactionsSubscribeResponse } from "../models/api/ITransactionsSubscribeResponse";
import { ITransactionsSubscriptionMessage } from "../models/api/ITransactionsSubscriptionMessage";
import { ITransactionsUnsubscribeRequest } from "../models/api/ITransactionsUnsubscribeRequest";
import { IClientNetworkConfiguration } from "../models/config/IClientNetworkConfiguration";

/**
 * Class to handle api communications.
 */
export class TransactionsClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Network configuration.
     */
    private readonly _config: IClientNetworkConfiguration;

    /**
     * The web socket to communicate on.
     */
    private readonly _socket: SocketIOClient.Socket;

    /**
     * The latest transactions.
     */
    private readonly _transactions: {
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
     * The tps interval.
     */
    private _tspInterval: number;

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
     * @param networkConfiguration The network configurations.
     */
    constructor(endpoint: string, networkConfiguration: IClientNetworkConfiguration) {
        this._endpoint = endpoint;
        this._config = networkConfiguration;

        // eslint-disable-next-line new-cap
        this._socket = SocketIOClient(this._endpoint);
        this._transactions = [];
        this._tps = [];
        this._tspInterval = 1;
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
                const subscribeRequest: ITransactionsSubscribeRequest = {
                    network: this._config.network
                };
                this._socket.emit("subscribe", subscribeRequest);
                this._socket.on("subscribe", (subscribeResponse: ITransactionsSubscribeResponse) => {
                    if (subscribeResponse.success) {
                        this._subscriptionId = subscribeResponse.subscriptionId;
                    }
                });
                this._socket.on("transactions", async (transactionsResponse: ITransactionsSubscriptionMessage) => {
                    if (transactionsResponse.subscriptionId === this._subscriptionId) {
                        this._tps = transactionsResponse.tps;
                        this._tspInterval = transactionsResponse.tpsInterval;

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

                            if (this._transactions.length > 200) {
                                this._transactions.splice(2000, this._transactions.length - 2000);
                            }
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
                const unsubscribeRequest: ITransactionsUnsubscribeRequest = {
                    network: this._config.network,
                    subscriptionId: this._subscriptionId
                };
                this._socket.emit("unsubscribe", unsubscribeRequest);
                this._socket.on("unsubscribe", () => { });
            }
        } catch {
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
            const oneMinuteCount = Math.min(60 / this._tspInterval, tps.length);
            const total = tps.slice(0, oneMinuteCount).reduce((a, b) => a + b, 0);
            return total / oneMinuteCount / this._tspInterval;
        }
        return -1;
    }
}
