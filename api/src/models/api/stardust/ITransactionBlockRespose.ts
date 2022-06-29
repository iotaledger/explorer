import { IBlock } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface ITransactionBlockResponse extends IResponse {
    /**
     * Transaction included block.
     */
    transactionBlock?: IBlock;
}
