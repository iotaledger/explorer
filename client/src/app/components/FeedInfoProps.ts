export interface FeedInfoProps {
    /**
     * The latest milestone index.
     */
    latestMilestoneIndex?: number;

    /**
     * The number of seconds passed since last milestone.
     */
    secondsSinceLastMilestone?: number;

    /**
     * Targeted time in seconds to add latest milestone.
     */
    milestoneFrequencyTarget?: number;
}
