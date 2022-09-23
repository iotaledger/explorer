import { IAnalyticStats } from "../../../models/api/stats/IAnalyticStats";
import { IShimmerClaimStats } from "../../../models/api/stats/IShimmerClaimingStatsResponse";
import { CurrencyState } from "../CurrencyState";

export interface FeedsState extends CurrencyState {
    /**
     * The items per second.
     */
    itemsPerSecond: string;

    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecond: string;

    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecondPercent: string;

    /**
     * The latest milestone index.
     */
    latestMilestoneIndex?: number;

    /**
     * The items per second.
     */
    itemsPerSecondHistory: number[];

    /**
     * The chonicle analytic stats.
     */
    networkAnalytics?: IAnalyticStats;

    /**
     * The shimmer token claiming stat for the network.
     */
    shimmerClaimingStats?: IShimmerClaimStats;
}
