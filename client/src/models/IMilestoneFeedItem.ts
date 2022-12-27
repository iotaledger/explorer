import { IMilestoneStatsPerInclusionState, IMilestoneStatsPerPayloadType } from "./api/stats/IMilestoneAnalyticStats";

export interface IMilestoneFeedItem {
    /**
     * The block id.
     */
    blockId: string;

    /**
     * The milestone index.
     */
    index: number;

    /**
     * The milestone id.
     */
    milestoneId: string;

    /**
     * The milestone timestamp.
     */
    timestamp: number;

    /**
     * The number of blocks referenced by the requested milestone.
     */
    blocksCount?: number;

    /**
     * The various per payload type counts.
     */
    perPayloadType?: IMilestoneStatsPerPayloadType;

    /**
     * The various per inclusion state counts.
     */
    perInclusionState?: IMilestoneStatsPerInclusionState;
}

