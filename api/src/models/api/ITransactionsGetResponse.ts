import { IResponse } from "./IResponse";
import { ITransactionsCursor } from "./ITransactionsCursor";
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
     * Cursor for getting more items.
     */
    cursor?: ITransactionsCursor;
}
