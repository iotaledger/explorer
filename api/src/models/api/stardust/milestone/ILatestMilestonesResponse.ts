import { IResponse } from "../../IResponse";
import { IMilestoneStatsPerInclusionState, IMilestoneStatsPerPayloadType } from "../../stats/IMilestoneAnalyticStats";

export interface ILatestMilestone {
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
    blocksCount: number;

    /**
     * The various per payload type counts.
     */
    perPayloadType: IMilestoneStatsPerPayloadType;

    /**
     * The various per inclusion state counts.
     */
    perInclusionState: IMilestoneStatsPerInclusionState;
}

export interface ILatestMilestonesReponse extends IResponse {
    /**
     * The latest milestones.
     */
    milestones: ILatestMilestone[];
}

