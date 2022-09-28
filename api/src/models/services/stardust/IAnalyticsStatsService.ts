import { IAnalyticStats } from "../../api/stats/IAnalyticStats";
/**
 * Interface for analytics stats service.
 */
export interface IAnalyticsStatsService {
    /**
     * Gets the stats.
     */
    getAnalytics(): IAnalyticStats;
}

