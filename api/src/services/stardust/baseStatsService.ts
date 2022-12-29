import { IMilestoneAnalyticStats } from "../../models/api/stats/IMilestoneAnalyticStats";
import { INetwork } from "../../models/db/INetwork";
import { IStatistics } from "../../models/services/IStatistics";
import { IStatsService } from "../../models/services/IStatsService";

/**
 * Class to handle stats service.
 */
export abstract class BaseStatsService implements IStatsService {
    /**
     * The network configuration.
     */
    protected readonly _networkConfiguration: INetwork;

    /**
     * The statistics.
     */
    protected _statistics: IStatistics[];

    /**
     * The shimmer milestones stats cache.
     */
    protected _milestoneStatsCache: {
        [milestoneId: string]: IMilestoneAnalyticStats;
    };

    /**
     * Create a new instance of BaseStatsService.
     * @param networkConfiguration The network configuration.
     */
    constructor(networkConfiguration: INetwork) {
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
        this._milestoneStatsCache = {};

        setInterval(async () => this.updateStatistics(), 2000);
    }

    /**
     * Get the current stats.
     * @returns The statistics for the network.
     */
    public getStats(): IStatistics {
        return this._statistics[this._statistics.length - 1];
    }

    /**
     * Fetch the current Shimmer milestone stats.
     * @returns The current shimmer milestone stats.
     */
    public getMilestoneStats(): { [milestoneId: string]: IMilestoneAnalyticStats } {
        return this._milestoneStatsCache;
    }

    /**
     * Get the stats history.
     * @returns The historical statistics for the network.
     */
    public getItemsPerSecondHistory(): number[] {
        return this._statistics.map(s => s.itemsPerSecond);
    }

    /**
     * Gather more statistics.
     */
    protected abstract updateStatistics(): Promise<void>;
}

