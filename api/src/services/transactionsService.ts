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
    private static readonly TPS_INTERVAL: number = 5;

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
    private _transactions: { [hash: string]: number };

    /**
     * The tps history.
     */
    private _tps: number[];

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
        this._transactions = {};
        this._tps = [];
        this._total = 0;

        this.startTimer();
        await this.startZmq();
    }

    /**
     * Reset the service.
     */
    public async reset(): Promise<void> {
        this.stopTimer();
        this.stopZmq();

        this.startTimer();
        await this.startZmq();
    }

    /**
     * Subscribe to transactions feed.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribe(callback: (data: ITransactionsSubscriptionMessage) => Promise<void>): string {
        const id = TrytesHelper.generateHash(27);
        this._subscribers[id] = callback;
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
     * Update the subscriptions with newest trytes.
     */
    private async updateSubscriptions(): Promise<void> {
        const now = Date.now();

        const tranCount = Object.keys(this._transactions).length;

        if (tranCount >= 5 ||
            (now - this._lastSend > 15000 && tranCount > 0)) {

            for (const subscriptionId in this._subscribers) {
                const data: ITransactionsSubscriptionMessage = {
                    subscriptionId,
                    transactions: this._transactions,
                    tps: this._tps,
                    tpsInterval: TransactionsService.TPS_INTERVAL
                };

                await this._subscribers[subscriptionId](data);
            }

            this._transactions = {};
            this._lastSend = now;
        }
    }

    /**
     * Handle the transactions per second calculations.
     */
    private handleTps(): void {
        const lastTotal = this._total;
        this._total = 0;
        this._tps.unshift(lastTotal);
        this._tps = this._tps.slice(0, 100);
    }

    /**
     * Start the zmq services.
     */
    private async startZmq(): Promise<void> {
        this.stopZmq();

        const txMessage = this._config.zmqTransactionMessage || "tx_trytes";
        this._subscriptionId = await this._zmqService.subscribe(
            txMessage, async (evnt: string, message: ITxTrytes) => {
                if (!this._transactions[message.hash]) {
                    this._total++;
                    const tx = asTransactionObject(message.trytes);
                    this._transactions[message.hash] = tx.value;
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
}
