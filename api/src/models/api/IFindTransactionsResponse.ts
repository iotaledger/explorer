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
     * Are there more than the transactions returned.
     */
    totalCount?: number;

    /**
     * The mode to look for transactions.
     */
    mode?: FindTransactionsMode;

    /**
     * There were too many items to retrieve.
     */
    limitExceeded?: boolean;
}
