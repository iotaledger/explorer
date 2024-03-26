export interface ISlotAnalyticStats {
    slotIndex?: number;
    blockCount?: number;
    perPayloadType?: {
        transaction?: number;
        candidacy?: number;
        taggedData?: number;
        noPayload?: number;
    };
}
