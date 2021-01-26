import { ServiceFactory } from "../factories/serviceFactory";
import { IFeedItemMetadata } from "../models/api/IFeedItemMetadata";
import { IFeedSubscriptionMessage } from "../models/api/IFeedSubscriptionMessage";
import { IFeedService } from "../models/services/IFeedService";
import { IItemsService } from "../models/services/IItemsService";

/**
 * Class to handle messages service.
 */
export abstract class ItemServiceBase implements IItemsService {
    /**
     * The network configuration.
     */
    protected readonly _networkId: string;

    /**
     * The most recent items.
     */
    protected _items: string[];

    /**
     * The current total since last timestamp.
     */
    protected _totalItems: number;

    /**
     * The most recent item metadata.
     */
    protected _itemMetadata: { [id: string]: IFeedItemMetadata };

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
     * The latest milestone.
     */
    private _latestMilestoneIndex: number;

    /**
     * The callback for different events.
     */
    private readonly _subscribers: {
        [id: string]: (data: IFeedSubscriptionMessage) => Promise<void>;
    };

    /**
     * Milestone subscription id.
     */
    private _milestoneSubscriptionId: string;

    /**
     * Feed service.
     */
    private _feedService: IFeedService;

    /**
     * Create a new instance of ItemServiceBase.
     * @param networkId The network configuration.
     */
    constructor(networkId: string) {
        this._subscribers = {};
        this._timerCounter = 0;
        this._networkId = networkId;
    }

    /**
     * Initialise the service.
     */
    public init(): void {
        this._items = [];
        this._itemMetadata = {};
        this._ips = [];
        this._totalItems = 0;

        this._totalConfirmed = 0;

        this.startTimer();

        this._feedService = ServiceFactory.get<IFeedService>(`feed-${this._networkId}`);
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
        /**
         * The latest milestone index.
         */
        latestMilestoneIndex: number;
    } {
        let ips = 0;
        let cips = 0;

        const now = Date.now();

        const start = this._ips.length > 0 ? this._ips[this._ips.length - 1].ts : now;
        const end = this._ips.length > 0 ? this._ips[0].ts : now;

        const tps = this._ips;
        if (tps) {
            const spanS = (end - start) / 1000;
            if (spanS > 0 && this._ips.length > 0) {
                let txTotal = 0;
                let snTotal = 0;
                for (const t of tps) {
                    txTotal += t.itemCount;
                    snTotal += t.confirmedCount;
                }
                ips = txTotal / spanS;
                cips = snTotal / spanS;
            }
        }
        return {
            itemsPerSecond: Number.parseFloat(ips.toFixed(2)),
            confirmedItemsPerSecond: Number.parseFloat(cips.toFixed(2)),
            confirmationRate: Number.parseFloat((ips > 0 ? cips / ips * 100 : 0).toFixed(2)),
            latestMilestoneIndex: this._latestMilestoneIndex
        };
    }

    /**
     * Start the subscriptions.
     */
    protected startSubscription(): void {
        this.stopSubscription();

        this._milestoneSubscriptionId = this._feedService.subscribeMilestones(
            (milestone: number, id: string, timestamp: number) => {
                this._latestMilestoneIndex = milestone;
                this._itemMetadata[id] = {
                    milestone,
                    ...this._itemMetadata[id]
                };
            });
    }

    /**
     * Stop the subscriptions.
     */
    protected stopSubscription(): void {
        this._totalItems = 0;
        this._totalConfirmed = 0;

        if (this._milestoneSubscriptionId) {
            this._feedService.unsubscribe(this._milestoneSubscriptionId);
            this._milestoneSubscriptionId = undefined;
        }
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

        if (Object.keys(this._items).length > 0 ||
            Object.keys(this._itemMetadata).length > 0 ||
            singleSubscriberId) {
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
                    itemsMetadata: this._itemMetadata,
                    ips
                };

                await subs[subscriptionId](data);
            }

            if (!singleSubscriberId) {
                this._items = [];
                this._itemMetadata = {};
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
