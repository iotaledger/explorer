import { IAnalyticStats } from "../api/stats/IAnalyticStats";
import { DailyMilestones } from "./IDailyMilestones";

export interface IAnalyticsStore {
    /**
     * The network the analytics are for.
     */
    network: string;

    /**
     * The analitics daily milestones.
     */
    dailyMilestones: DailyMilestones;

    /**
     * The current analitics data.
     */
    analytics: IAnalyticStats;
}

