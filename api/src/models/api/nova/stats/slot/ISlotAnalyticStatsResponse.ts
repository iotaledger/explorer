import { IResponse } from "../../IResponse";

export interface ISlotAnalyticStatsResponse extends IResponse {
    slotIndex?: number;
    blockCount?: number;
    perPayloadType?: {
        transaction?: number;
        candidacy?: number;
        taggedData?: number;
        noPayload?: number;
    };
}
