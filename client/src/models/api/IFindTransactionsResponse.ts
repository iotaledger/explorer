import { ConfirmationState } from "./confirmationState";
import { FindTransactionsMode } from "./findTransactionsMode";
import { IResponse } from "./IResponse";

export interface IFindTransactionsResponse extends IResponse {
    /**
     * The items for the matching transaction.
     */
    hashes?: string[];

    /**
     * The trytes for single transaction if thats what the hash was for.
     */
    trytes?: string;

    /**
     * The confirmation state of the single transaction.
     */
    confirmationState?: ConfirmationState;

    /**
     * The mode to look for transactions.
     */
    mode?: FindTransactionsMode;

    /**
     * The total number of items.
     */
    totalItems?: number;

    /**
     * There were too many items to retrieve.
     */
    limitExceeded?: boolean;
}
