export interface IStatistics {
    /**
     * The items per second.
     */
    itemsPerSecond?: number;
    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecond?: number;
    /**
     * The confirmed rate.
     */
    confirmationRate?: number;
    /**
     * The latest milestone index.
     */
    latestMilestoneIndex?: number;
    /**
     * The latest milestone index time.
     */
    latestMilestoneIndexTime?: number;
}
