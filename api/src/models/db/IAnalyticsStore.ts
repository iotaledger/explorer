import { IAnalyticStats } from "../api/stats/IAnalyticStats";

export interface IAnalyticsStore {
    /**
     * The network the analytics are for.
     */
    network: string;

    /**
     * The current analitics data.
     */
    analytics: IAnalyticStats;
}

