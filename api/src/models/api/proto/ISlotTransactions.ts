import { ISlotTransactions } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface ISlotTransactionsResponse extends IResponse {
    transactions?: ISlotTransactions;
}
