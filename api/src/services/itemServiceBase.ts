import { IFeedItemChrysalis } from "../models/api/og/IFeedItemChrysalis";
import { IFeedItemOg } from "../models/api/og/IFeedItemOg";
import { IFeedSubscriptionMessage } from "../models/api/og/IFeedSubscriptionMessage";

/**
 * Class to handle messages service.
 */
export abstract class ItemServiceBase {
    /**
     * The most recent items.
     */
    protected _items: (IFeedItemOg | IFeedItemChrysalis)[];

    /**
     * The current total since last timestamp.
     */
    protected _totalItems: number;

    /**
     * The most recent confirmed items.
     */
    protected _confirmedIds: string[];

    /**
     * The current total confirmed since last timestamp.
     */
    protected _totalConfirmed: number;

    /**
     * The items per second history.
     */
    private _ips: {
        /**
         * Timestamp of count.
         */
        ts: number;
        /**
         * Item count.
         */
        itemCount: number;
        /**
         * Confirmed count.
         */
        confirmedCount: number;
    }[];

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
     * Create a new instance of ItemServiceBase.
     */
    constructor() {
        this._subscribers = {};
        this._timerCounter = 0;
    }

    /**
     * Initialise the service.
     */
    public init(): void {
        this._items = [];
        this._ips = [];
        this._totalItems = 0;

        this._confirmedIds = [];
        this._totalConfirmed = 0;

        this.startTimer();
    }

    /**
     * Reset the service.
     */
    public reset(): void {
        this.stopTimer();
        this.stopSubscription();

        this.startTimer();
        this.startSubscription();
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
     * Get the current stats.
     * @returns The statistics for the network.
     */
    public getStats(): {
        /**
         * The transations per second.
         */
        itemsPerSecond: number;
        /**
         * The confirmed transations per second.
         */
        confirmedItemsPerSecond: number;
        /**
         * The confirmed rate.
         */
        confirmationRate: number;
    } {
        let ips = 0;
        let cips = 0;

        const now = Date.now();

        const start = this._ips.length > 0 ? this._ips[this._ips.length - 1].ts : now;
        const end = this._ips.length > 0 ? this._ips[0].ts : now;

        const tps = this._ips;
        if (tps) {
            const spanS = (end - start) / 1000;
            if (spanS > 0) {
                if (this._ips.length > 0) {
                    const txTotal = tps.map(t => t.itemCount).reduce((a, b) => a + b, 0);
                    ips = txTotal / spanS;

                    const snTotal = tps.map(t => t.confirmedCount).reduce((a, b) => a + b, 0);
                    cips = snTotal / spanS;
                }
            }
        }
        return {
            itemsPerSecond: Number.parseFloat(ips.toFixed(2)),
            confirmedItemsPerSecond: Number.parseFloat(cips.toFixed(2)),
            confirmationRate: Number.parseFloat((ips > 0 ? cips / ips * 100 : 0).toFixed(2))
        };
    }

    /**
     * Start the subscriptions.
     */
    protected startSubscription(): void {
        this.stopSubscription();
    }

    /**
     * Stop the subscriptions.
     */
    protected stopSubscription(): void {
        this._totalItems = 0;
        this._totalConfirmed = 0;
    }

    /**
     * Start the timer for tps.
     */
    private startTimer(): void {
        this.stopTimer();
        this._timerId = setInterval(
            async () => {
                if (this._timerCounter++ % 10 === 0) {
                    this.handleTps();
                }
                await this.updateSubscriptions();
            },
            500);
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

        const tranCount = Object.keys(this._items).length;
        const snCount = this._confirmedIds.length;

        if (tranCount > 0 || snCount > 0 || singleSubscriberId) {
            let subs: {
                [id: string]: (data: IFeedSubscriptionMessage) => Promise<void>;
            };

            if (singleSubscriberId) {
                subs = {};
                subs[singleSubscriberId] = this._subscribers[singleSubscriberId];
            } else {
                subs = this._subscribers;
            }

            const ips = {
                start: this._ips.length > 0 ? this._ips[this._ips.length - 1].ts : now,
                end: this._ips.length > 0 ? this._ips[0].ts : now,
                itemCount: this._ips.map(t => t.itemCount),
                confirmedItemCount: this._ips.map(t => t.confirmedCount)
            };

            for (const subscriptionId in subs) {
                const data: IFeedSubscriptionMessage = {
                    subscriptionId,
                    items: this._items,
                    confirmed: this._confirmedIds,
                    ips
                };

                await subs[subscriptionId](data);
            }

            if (!singleSubscriberId) {
                this._items = [];
                this._confirmedIds = [];
            }
        }
    }

    /**
     * Handle the transactions per second calculations.
     */
    private handleTps(): void {
        const lastTxTotal = this._totalItems;
        const lastConfirmedTotal = this._totalConfirmed;
        this._totalItems = 0;
        this._totalConfirmed = 0;
        this._ips.unshift({
            itemCount: lastTxTotal,
            confirmedCount: lastConfirmedTotal,
            ts: Date.now()
        });
        this._ips = this._ips.slice(0, 100);
    }
}
