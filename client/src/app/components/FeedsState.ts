import { IAnalyticStats } from "../../models/api/stats/IAnalyticStats";
import { CurrencyState } from "./CurrencyState";

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
     * Latest milestones.
     */
    milestones: {
        /**
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];

    /**
     * The chonicle analytic stats.
     */
    networkAnalytics?: IAnalyticStats;
}
