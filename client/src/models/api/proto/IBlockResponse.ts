import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    id: string;
    version: number;
    parents: string[];
    issuerPublicKey: string;
    issuingTime: number;
    sequenceNumber: number;
    payloadBytes: string;
    epochCommitment: string;
    latestConfirmedEpoch: number;
    nonce: string;
    signature: string;
}
