import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { ITransactionsSubscriptionMessage } from "../models/api/ITransactionsSubscriptionMessage";
import { INetworkConfiguration } from "../models/configuration/INetworkConfiguration";
import { ITxTrytes } from "../models/zmq/ITxTrytes";
import { TrytesHelper } from "../utils/trytesHelper";
import { ZmqService } from "./zmqService";

/**
 * Class to handle transactions service.
 */
export class TransactionsService {
    /**
     * The transaction per second interval.
     */
    private static readonly TPS_INTERVAL: number = 10;

    /**
     * The network configuration.
     */
    private readonly _config: INetworkConfiguration;

    /**
     * The zmq service.
     */
    private _zmqService: ZmqService;

    /**
     * The most recent transactions.
     */
    private _transactionValues: { [hash: string]: number };

    /**
     * The most recent transactions.
     */
    private _transactionTrytes: {
        /**
         * The transaction hash.
         */
        hash: string;
        /**
         * The transaction trytes.
         */
        trytes: string;
    }[];

    /**
     * The tps history.
     */
    private _tps: {
        /**
         * Timestamp of count.
         */
        ts: number;
        /**
         * Transaction count.
         */
        count: number;
    }[];

    /**
     * The current total since last timestamp.
     */
    private _total: number;

    /**
     * The last time we sent any data.
     */
    private _lastSend: number;

    /**
     * Subscription ids.
     */
    private _subscriptionId: string;

    /**
     * Timer id.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Timer counter.
     */
    private _timerCounter: number;

    /**
     * The callback for different events.
     */
    private readonly _subscribers: {
        [id: string]: (data: ITransactionsSubscriptionMessage) => Promise<void>;
    };

    /**
     * Create a new instance of TransactionsService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetworkConfiguration) {
        this._config = networkConfiguration;

        this._subscribers = {};
        this._lastSend = 0;
        this._timerCounter = 0;
    }

    /**
     * Initialise the service.
     */
    public async init(): Promise<void> {
        this._zmqService = ServiceFactory.get<ZmqService>(`zmq-${this._config.network}`);
        this._transactionValues = {};
        this._transactionTrytes = [];
        this._tps = [];
        this._total = 0;

        this.startTimer();
        this.startZmq();
    }

    /**
     * Reset the service.
     */
    public reset(): void {
        this.stopTimer();
        this.stopZmq();

        this.startTimer();
        this.startZmq();
    }

    /**
     * Find the transaction trytes for the hash.
     * @param hash The transaction hash to look for
     * @returns The transaction trytes if found.
     */
    public findTrytes(hash: string): string | undefined {
        const found = this._transactionTrytes.find(t => t.hash === hash);
        return found ? found.trytes : undefined;
    }

    /**
     * Subscribe to transactions feed.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(callback: (data: ITransactionsSubscriptionMessage) => Promise<void>): string {
        const id = TrytesHelper.generateHash(27);
        this._subscribers[id] = callback;
        setTimeout(async () => {
            await this.updateSubscriptions(id);
        }, 0);
        return id;
    }

    /**
     * Unsubscribe from the feed.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribe(subscriptionId: string): void {
        delete this._subscribers[subscriptionId];
    }

    /**
     * Start the zmq services.
     */
    private startZmq(): void {
        this.stopZmq();

        this._subscriptionId = this._zmqService.subscribe(
            "trytes", async (evnt: string, message: ITxTrytes) => {
                if (!this._transactionValues[message.hash]) {
                    this._total++;
                    const tx = asTransactionObject(message.trytes);
                    this._transactionValues[message.hash] = tx.value;
                    this._transactionTrytes.unshift({ hash: message.hash, trytes: message.trytes });
                    this._transactionTrytes = this._transactionTrytes.slice(0, 1000);
                }
            });
    }

    /**
     * Stop the zmq services.
     */
    private stopZmq(): void {
        this._total = 0;
        if (this._subscriptionId) {
            this._zmqService.unsubscribe(this._subscriptionId);
            this._subscriptionId = undefined;
        }
    }

    /**
     * Start the timer for tps.
     */
    private startTimer(): void {
        this.stopTimer();
        this._timerId = setInterval(
            async () => {
                if (this._timerCounter++ % TransactionsService.TPS_INTERVAL === 0) {
                    this.handleTps();
                }
                await this.updateSubscriptions();
            },
            1000);
    }

    /**
     * Stop the timer for tps.
     */
    private stopTimer(): void {
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Update the subscriptions with newest trytes.
     * @param singleSubscriberId Update an individual subscriber.
     */
    private async updateSubscriptions(singleSubscriberId?: string): Promise<void> {
        const now = Date.now();

        const tranCount = Object.keys(this._transactionValues).length;

        if (tranCount > 0 ||
            (now - this._lastSend > TransactionsService.TPS_INTERVAL * 1000) ||
            singleSubscriberId
        ) {
            const subs = singleSubscriberId
                ? { subscriberId: this._subscribers[singleSubscriberId] }
                : this._subscribers;

            for (const subscriptionId in subs) {
                const data: ITransactionsSubscriptionMessage = {
                    subscriptionId,
                    transactions: this._transactionValues,
                    tps: this._tps.map(t => t.count),
                    tpsStart: this._tps.length > 0 ? this._tps[this._tps.length - 1].ts : now,
                    tpsEnd: this._tps.length > 0 ? this._tps[0].ts : now
                };

                await subs[subscriptionId](data);
            }

            if (!singleSubscriberId) {
                this._transactionValues = {};
                this._lastSend = now;
            }
        }
    }

    /**
     * Handle the transactions per second calculations.
     */
    private handleTps(): void {
        const lastTotal = this._total;
        this._total = 0;
        this._tps.unshift({
            count: lastTotal,
            ts: Date.now()
        });
        this._tps = this._tps.slice(0, 100);
    }
}
