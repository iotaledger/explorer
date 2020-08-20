import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { IFeedSubscriptionMessage } from "../models/api/IFeedSubscriptionMessage";
import { ITxTrytes } from "../models/zmq/ITxTrytes";
import { ZmqService } from "./zmqService";

/**
 * Class to handle transactions service.
 */
export class TransactionsService {
    /**
     * The network configuration.
     */
    private readonly _networkId: string;

    /**
     * The zmq service.
     */
    private _zmqService: ZmqService;

    /**
     * The most recent transactions.
     */
    private _transactionValues: {
        [hash: string]: {
            trunk: string;
            branch: string;
            value: number;
        };
    };

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
        [id: string]: (data: IFeedSubscriptionMessage) => Promise<void>;
    };

    /**
     * Create a new instance of TransactionsService.
     * @param networkId The network configuration.
     */
    constructor(networkId: string) {
        this._networkId = networkId;

        this._subscribers = {};
        this._timerCounter = 0;
    }

    /**
     * Initialise the service.
     */
    public async init(): Promise<void> {
        this._zmqService = ServiceFactory.get<ZmqService>(`zmq-${this._networkId}`);
        this._transactionValues = {};
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
     * Subscribe to transactions feed.
     * @param id The id of the subscriber.
     * @param callback The callback to call with data for the event.
     */
    public async subscribe(id: string, callback: (data: IFeedSubscriptionMessage) => Promise<void>): Promise<void> {
        this._subscribers[id] = callback;

        setTimeout(async () => {
            await this.updateSubscriptions(id);
        }, 0);
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
                    this._transactionValues[message.hash] = {
                        value: tx.value,
                        branch: tx.branchTransaction,
                        trunk: tx.trunkTransaction
                    };
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
                if (this._timerCounter++ % 10000 === 0) {
                    this.handleTps();
                }
                await this.updateSubscriptions();
            },
            100);
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

        if (tranCount > 0 || singleSubscriberId) {
            let subs: {
                [id: string]: (data: IFeedSubscriptionMessage) => Promise<void>;
            };

            if (singleSubscriberId) {
                subs = {};
                subs[singleSubscriberId] = this._subscribers[singleSubscriberId];
            } else {
                subs = this._subscribers;
            }

            for (const subscriptionId in subs) {
                const data: IFeedSubscriptionMessage = {
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
