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
        /**
         * The connected trunk.
         */
        trunk: string;
        /**
         * The connected branch.
         */
        branch: string;
    }[];

    /**
     * Existing hashes.
     */
    private _existingHashes: string[];

    /**
     * The confirmed transactions.
     */
    private _confirmed: string[];

    /**
     * The tps.
     */
    private _tps: {
        /**
         * The start timestamp for the tps.
         */
        start: number;

        /**
         * The end timestamp for the tps.
         */
        end: number;

        /**
         * The tps counts.
         */
        tx: number[];

        /**
         * The confirmed tps counts.
         */
        sn: number[];
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

        // Use websocket by default
        // eslint-disable-next-line new-cap
        this._socket = SocketIOClient(this._endpoint, { upgrade: true, transports: ["websocket"] });

        // If reconnect fails then also try polling mode.
        this._socket.on("reconnect_attempt", () => {
            this._socket.io.opts.transports = ["polling", "websocket"];
        });

        this._transactions = [];
        this._confirmed = [];
        this._existingHashes = [];
        this._tps = {
            start: 0,
            end: 0,
            tx: [],
            sn: []
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
                        this._tps = transactionsResponse.tps;
                        this._confirmed = transactionsResponse.confirmed;

                        const newTxs = transactionsResponse.transactions;
                        if (newTxs) {
                            this._transactions = newTxs
                                .filter(nh => !this._existingHashes.includes(nh.hash))
                                .concat(this._transactions);

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
                            this._existingHashes = this._transactions.map(t => t.hash);
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
         * The trunk.
         */
        trunk: string;
        /**
         * The branch.
         */
        branch: string;
        /**
         * The transaction value.
         */
        value: number;
    }[] {
        return this._transactions.slice();
    }

    /**
     * Get the confirmed transactions as hashes.
     * @returns The hahes.
     */
    public getConfirmedTransactions(): string[] {
        return this._confirmed;
    }

    /**
     * Get the tps history array.
     * @returns The tps.
     */
    public getTxTpsHistory(): number[] {
        return this._tps.tx.slice();
    }

    /**
     * Calculate the tps.
     * @returns The tps.
     */
    public getTps(): {
        /**
         * Transactions count per second.
         */
        tx: number;
        /**
         * Confirmed count per second.
         */
        sn: number;
    } {
        let txTps = -1;
        let snTps = -1;

        const tps = this._tps;
        if (tps) {
            const spanS = (this._tps.end - this._tps.start) / 1000;
            if (spanS > 0) {
                if (tps.tx.length > 0) {
                    const txTotal = tps.tx.reduce((a, b) => a + b, 0);
                    txTps = txTotal / spanS;
                }
                if (tps.sn.length > 0) {
                    const snTotal = tps.sn.reduce((a, b) => a + b, 0);
                    snTps = snTotal / spanS;
                }
            }
        }
        return {
            tx: txTps,
            sn: snTps
        };
    }
}
