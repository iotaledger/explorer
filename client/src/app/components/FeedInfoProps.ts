import { NetworkType } from "../../models/config/networkType";

export interface FeedInfoProps {
    /**
     * The latest milestone index.
     */
    latestMilestoneIndex?: number;

    /**
     * Targeted time in seconds to add latest milestone.
     */
    milestoneFrequencyTarget?: number;

    /**
     * The latest milestone timestamp.
     */
    latestMilestoneTimestamp?: number;

    /**
     * The network type.
     */
    network?: NetworkType;
}
