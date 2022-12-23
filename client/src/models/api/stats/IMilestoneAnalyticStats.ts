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

interface IMilestoneStatsPerInclusionState {
    /**
     * The number of confirmed transactions referenced by the requested milestone.
     */
    confirmedTxCount: number;
    /**
     * The number of conflicting transactions referenced by the requested milestone.
     */
    conflictingTxCount: number;
    /**
     * The number of non - transaction blocks referenced by the requested milestone.
     */
    noTxCount: number;
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
    /**
     * The various per inclusion state counts.
     */
    perInclusionState?: IMilestoneStatsPerInclusionState;
}

export interface ILatestMilestone extends IResponse {
    /**
     * The hash.
     */
    id: string;

    /**
     * Metadata for the item.
     */
    properties: { [key: string]: unknown };
}
