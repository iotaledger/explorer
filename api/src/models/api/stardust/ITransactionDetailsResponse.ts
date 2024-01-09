import { Block } from "@iota/sdk";
import { IResponse } from "../IResponse";

export interface ITransactionDetailsResponse extends IResponse {
    /**
     * Transaction included block.
     */
    block?: Block;
}
