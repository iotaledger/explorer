import { IAnalyticStats } from "../../../models/api/stats/IAnalyticStats";
import { IProtoStats } from "../../../models/api/stats/IProtoStats";

export interface FeedsState {
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
     * The current mana stats.
     */
    protoStats?: IProtoStats;
}

