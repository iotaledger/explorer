import { IResponse } from "./IResponse";
import { TransactionsGetMode } from "./transactionsGetMode";

export interface ITransactionsGetResponse extends IResponse {
    /**
     * The items for the matching transaction.
     */
    hashes?: string[];

    /**
     * The mode to look for transactions.
     */
    mode?: TransactionsGetMode;

    /**
     * The total number of transactions.
     */
    total?: number;
}
