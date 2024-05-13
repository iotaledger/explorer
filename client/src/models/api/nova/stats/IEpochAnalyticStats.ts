import { IResponse } from "../IResponse";

export interface IEpochAnalyticStats extends IResponse {
    epochIndex?: number;
    blockCount?: number;
    perPayloadType?: {
        transaction?: number;
        candidacy?: number;
        taggedData?: number;
        noPayload?: number;
    };
}
