import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedItemMetadata } from "../../models/api/legacy/IFeedItemMetadata";
import { IFeedSubscriptionItem } from "../../models/api/legacy/IFeedSubscriptionItem";
import { IFeedService } from "../../models/services/IFeedService";
import { IStatistics } from "../../models/services/IStatistics";
import { IItemsService } from "../../models/services/legacy/IItemsService";
import { ISn } from "../../models/zmq/ISn";
import { ITxTrytes } from "../../models/zmq/ITxTrytes";
import { ZmqService } from "./zmqService";

/**
 * Class to handle transactions service.
 */
export class LegacyItemsService implements IItemsService {
    /**
     * The network configuration.
     */
    private readonly _networkId: string;

    /**
     * The most recent items.
     */
    private _items: string[];

    /**
     * The current total since last timestamp.
     */
    private _totalItems: number;

    /**
     * The most recent item metadata.
     */
    private _itemMetadata: { [id: string]: IFeedItemMetadata };

    /**
     * The current total confirmed since last timestamp.
     */
    private _totalConfirmed: number;

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
     * The latest milestone.
     */
    private _latestMilestoneIndex: number;

    /**
     * The latest milestone time.
     */
    private _latestMilestoneIndexTime: number;

    /**
     * The callback for different events.
     */
    private readonly _subscribers: {
        [id: string]: (data: IFeedSubscriptionItem) => Promise<void>;
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
     * The zmq service.
     */
    private _zmqService: ZmqService;

    /**
     * Item subscription id.
     */
    private _itemSubscriptionId: string;

    /**
     * Confirmed subscription id.
     */
    private _confirmedSubscriptionId: string;

    /**
     * Create a new instance of LegacyItemsService.
     * @param networkId The network configuration.
     */
    constructor(networkId: string) {
        this._subscribers = {};
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

        this._feedService = ServiceFactory.get<IFeedService>(`feed-${this._networkId}`);
        this._zmqService = ServiceFactory.get<ZmqService>(`zmq-${this._networkId}`);

        this.startSubscription();

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
    public async subscribe(id: string, callback: (data: IFeedSubscriptionItem) => Promise<void>): Promise<void> {
        this._subscribers[id] = callback;
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
    public getStats(): IStatistics {
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
            latestMilestoneIndex: this._latestMilestoneIndex,
            latestMilestoneIndexTime: this._latestMilestoneIndexTime
        };
    }

    /**
     * Start the subscriptions.
     */
    private startSubscription(): void {
        this.stopSubscription();

        this._milestoneSubscriptionId = this._feedService.subscribeMilestones(
            (milestone: number, id: string, timestamp: number) => {
                this._latestMilestoneIndex = milestone;
                this._latestMilestoneIndexTime = timestamp;
                this._itemMetadata[id] = {
                    milestone,
                    ...this._itemMetadata[id]
                };
            });

        this._itemSubscriptionId = this._zmqService.subscribe(
            "trytes", async (evnt: string, message: ITxTrytes) => {
                this._totalItems++;

                this._items.push(message.trytes);
            });

        this._confirmedSubscriptionId = this._zmqService.subscribe(
            "sn", async (evnt: string, message: ISn) => {
                this._totalConfirmed++;
                this._itemMetadata[message.transaction] = {
                    confirmed: message.index,
                    ...this._itemMetadata[message.transaction]
                };
            });
    }

    /**
     * Stop the subscriptions.
     */
    private stopSubscription(): void {
        this._totalItems = 0;
        this._totalConfirmed = 0;

        if (this._milestoneSubscriptionId) {
            this._feedService.unsubscribe(this._milestoneSubscriptionId);
            this._milestoneSubscriptionId = undefined;
        }
        if (this._itemSubscriptionId) {
            this._zmqService.unsubscribe(this._itemSubscriptionId);
            this._itemSubscriptionId = undefined;
        }
        if (this._confirmedSubscriptionId) {
            this._zmqService.unsubscribe(this._confirmedSubscriptionId);
            this._confirmedSubscriptionId = undefined;
        }
    }

    /**
     * Start the timer for tps.
     */
    private startTimer(): void {
        this.stopTimer();
        this._timerId = setTimeout(
            async () => {
                this.handleTps();
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
     */
    private async updateSubscriptions(): Promise<void> {
        if (this._items.length > 0 ||
            Object.keys(this._itemMetadata).length > 0) {
            for (const subscriptionId in this._subscribers) {
                const data: IFeedSubscriptionItem = {
                    subscriptionId,
                    items: this._items,
                    itemsMetadata: this._itemMetadata
                };

                try {
                    await this._subscribers[subscriptionId](data);
                } catch { }
            }

            this._items = [];
            this._itemMetadata = {};
        }

        this.startTimer();
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
