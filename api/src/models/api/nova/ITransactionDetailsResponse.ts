import { Block } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface ITransactionDetailsResponse extends IResponse {
    /**
     * Transaction included block.
     */
    block?: Block;
}
