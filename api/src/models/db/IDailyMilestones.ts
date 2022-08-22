/**
 * Contains data for first & last milestone indexes of the previous day.
 * Used in Chronicle analytic requests that require a range of milestones.
 */
export interface DailyMilestones {
    /**
     * Yesterdays first milestone index.
     */
    first?: number;
    /**
     * Yesterdays last milestone index.
     */
    last?: number;
}

