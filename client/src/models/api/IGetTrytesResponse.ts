import { IResponse } from "./IResponse";

export interface IGetTrytesResponse extends IResponse {
    /**
     * The trytes for the requested transactions.
     */
    trytes?: string[];

    /**
     * The milestones index of the transactions.
     */
    milestoneIndexes?: number[];
}
