import { IEpochTransactions } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IEpochTransactionsResponse extends IResponse {
    transactions?: IEpochTransactions;
}
