import { FindTransactionsMode } from "./findTransactionsMode";
import { IResponse } from "./IResponse";

export interface IFindTransactionsResponse extends IResponse {
    /**
     * The items for the matching transaction.
     */
    hashes?: string[];

    /**
     * The mode to look for transactions.
     */
    mode?: FindTransactionsMode;

    /**
     * There were too many items to retrieve.
     */
    limitExceeded?: boolean;

    /**
     * Cursor to use for subsequent requests.
     */
    cursor?: string;
}
