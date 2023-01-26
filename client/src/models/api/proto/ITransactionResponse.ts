import { ITransaction } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface ITransactionResponse extends IResponse {
    /**
     * Transaction.
     */
    tx?: ITransaction;
}
