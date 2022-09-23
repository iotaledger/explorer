import moment from "moment";
import cron from "node-cron";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IAnalyticStats } from "../../models/api/stats/IAnalyticStats";
import { IShimmerClaimStats } from "../../models/api/stats/IShimmerClaimStats";
import { IAnalyticsStore } from "../../models/db/IAnalyticsStore";
import { INetwork } from "../../models/db/INetwork";
import { IStatistics } from "../../models/services/IStatistics";
import { IStatsService } from "../../models/services/IStatsService";
import { IStorageService } from "../../models/services/IStorageService";
import { IAnalyticsStatsService } from "../../models/services/stardust/IAnalyticsStatsService";
import { IShimmerStatsService } from "../../models/services/stardust/IShimmerStatsService";

/**
 * Class to handle stats service.
 */
export abstract class BaseStatsService implements IStatsService, IAnalyticsStatsService, IShimmerStatsService {
    /**
     * The network configuration.
     */
    protected readonly _networkConfiguration: INetwork;

    /**
     * The statistics.
     */
    protected _statistics: IStatistics[];

    /**
     * Interval in hours of analytics stats refresh.
     */
    protected readonly ANALYTICS_REFERSH_FREQ_HOURS = 3;

    /**
     * The analytics storage.
     */
    protected readonly _analyticsStorage: IStorageService<IAnalyticsStore>;

    /**
     * Timer handle of analytics refresh job.
     */
    private _analyticsTimer?: NodeJS.Timer;

    /**
     * Create a new instance of BaseStatsService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetwork) {
        this._analyticsStorage = ServiceFactory.get<IStorageService<IAnalyticsStore>>("analytics-storage");
        this._networkConfiguration = networkConfiguration;
        this._statistics = [
            {
                itemsPerSecond: 0,
                confirmedItemsPerSecond: 0,
                confirmationRate: 0,
                latestMilestoneIndex: 0,
                latestMilestoneIndexTime: 0
            }
        ];

        setInterval(async () => this.updateStatistics(), 2000);
        this.setupDailyMilestonesJob();
        this.setupAnalytics();
    }

    /**
     * Get the current stats.
     * @returns The statistics for the network.
     */
    public getStats(): IStatistics {
        return this._statistics[this._statistics.length - 1];
    }

    /**
     * Get the current analytic stats.
     * @returns The current analytic stats.
     */
    public async getAnalytics(): Promise<IAnalyticStats> {
        const analyticsStore = await this._analyticsStorage.get(this._networkConfiguration.network);
        return analyticsStore.analytics;
    }

    /**
     * Fetch the current Shimmer stats.
     * @returns The current shimmer claiming stats.
     */
    public async getShimmerStats(): Promise<IShimmerClaimStats> {
        const analyticsStore = await this._analyticsStorage.get(this._networkConfiguration.network);
        return { count: analyticsStore.shimmerClaimingStats };
    }

    /**
     * Get the stats history.
     * @returns The historical statistics for the network.
     */
    public getItemsPerSecondHistory(): number[] {
        return this._statistics.map(s => s.itemsPerSecond);
    }

    /**
     * Setup the analytics refresh interval.
     */
    protected setupAnalytics() {
        this.stopAnalytics();
        // eslint-disable-next-line no-void
        void this.fetchAnalyticStats();
        this._analyticsTimer = setInterval(
            async () => this.fetchAnalyticStats(),
            this.ANALYTICS_REFERSH_FREQ_HOURS * 60 * 60 * 1000
        );
    }

    /**
     * Initialize the analytics store with default values.
     * @param network The network in context.
     * @returns The initialized analytics store.
     */
    protected async initAnalyticsStore(network: string): Promise<IAnalyticsStore> {
        await this._analyticsStorage.set({
            network,
            dailyMilestones: {},
            analytics: {},
            milestoneAnalytics: {},
            shimmerClaimingStats: ""
        });

        const initialized = await this._analyticsStorage.get(network);
        return initialized;
    }


    /**
     * Stop the analytics refresh job.
     */
    private stopAnalytics(): void {
        if (this._analyticsTimer) {
            clearInterval(this._analyticsTimer);
            this._analyticsTimer = undefined;
        }
    }

    /**
     * Setup the refresh daily milestone range job.
     * Refreshes the first & last milestone seen per DAY.
     * The range is used in Chornicle analytic requests that use a range of milestones (daily addresses/transactions)
     */
    private setupDailyMilestonesJob(): void {
        const network = this._networkConfiguration.network;
        // At 23:59:59 every day
        const cronExpr = "59 59 23 * * *";

        // collect history milestones
        cron.schedule(cronExpr, async () => {
            let currentAnalyticsStore = await this._analyticsStorage.get(network);

            if (!currentAnalyticsStore) {
                currentAnalyticsStore = await this.initAnalyticsStore(network);
            }

            if (currentAnalyticsStore.dailyMilestones?.last) {
                currentAnalyticsStore.dailyMilestones.first = currentAnalyticsStore.dailyMilestones.last;
            }

            const lastMilestone = this._statistics[this._statistics.length - 1].latestMilestoneIndex;
            currentAnalyticsStore.dailyMilestones.last = lastMilestone;

            console.log(
                "Refreshed daily milestones for:",
                moment().format("DD-MM-YYYY"), "with", currentAnalyticsStore.dailyMilestones
            );
            // eslint-disable-next-line no-void
            void this._analyticsStorage.set(currentAnalyticsStore);
        });
    }

    /**
     * Gather more statistics.
     */
    protected abstract updateStatistics(): Promise<void>;

    /**
     * Refresh analytic stats from chronicle.
     */
    protected abstract fetchAnalyticStats(): Promise<void>;
}
