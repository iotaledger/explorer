import { TransactionsGetMode } from "./transactionsGetMode";
import { IResponse } from "./IResponse";

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
     * There were too many items to retrieve.
     */
    limitExceeded?: boolean;

    /**
     * Cursor to use for subsequent requests.
     */
    cursor?: string;
}
