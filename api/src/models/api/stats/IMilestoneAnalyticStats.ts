import { IResponse } from "../IResponse";

interface IMilestoneStatsPerPayloadType {
    /**
     * The number of transaction payloads referenced by the requested milestone.
     */
    txPayloadCount: number;
    /**
     * The number of treasury transaction payloads referenced by the requested milestone.
     */
    txTreasuryPayloadCount: number;
    /**
     * The number of milestone payloads referenced by the requested milestone.
     */
    milestonePayloadCount: number;
    /**
     * The number of tagged data payloads referenced by the requested milestone.
     */
    taggedDataPayloadCount: number;
    /**
     * The number of blocks without payload referenced by the requested milestone.
     */
    noPayloadCount: number;
}

export interface IMilestoneAnalyticStats extends IResponse {
    /**
     * The number of blocks referenced by the requested milestone.
     */
    blocksCount?: number;
    /**
     * The various per payload type counts.
     */
    perPayloadType?: IMilestoneStatsPerPayloadType;
}

