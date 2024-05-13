export interface IEpochAnalyticStats {
    epochIndex?: number;
    blockCount?: number;
    perPayloadType?: {
        transaction?: number;
        candidacy?: number;
        taggedData?: number;
        noPayload?: number;
    };
}
