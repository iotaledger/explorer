import { IResponse } from "../stardust/IResponse";

export interface IMilestoneAnalyticStats extends IResponse {
    milestoneIndex?: number;
    blockCount?: number;
    perPayloadType?: {
        transaction?: number;
        milestone?: number;
        taggedData?: number;
        treasuryTransaction?: number;
        noPayload?: number;
    };
}
