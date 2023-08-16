import { ICachedTransaction } from "../../../models/api/ICachedTransaction";
import { ITransactionsCursor } from "../../../models/api/legacy/ITransactionsCursor";

export interface TagState {
    /**
     * The tag to display.
     */
    tag?: string;

    /**
     * The tag remainder.
     */
    tagFill?: string;

    /**
     * Transaction hashes for the address.
     */
    items?: {
        /**
         * The transaction hash.
         */
        txHash: string;

        /**
         * The details details.
         */
        details?: ICachedTransaction;
    }[];

    /**
     * Transaction hashes for the address.
     */
    filteredItems?: {
        /**
         * The transaction hash.
         */
        txHash: string;

        /**
         * The details details.
         */
        details?: ICachedTransaction;
    }[];

    /**
     * Is the component status busy.
     */
    statusBusy: number;

    /**
     * The status.
     */
    status: string;

    /**
     * Format the iota in full.
     */
    formatFull?: boolean;

    /**
     * Hide zero transactions.
     */
    showOnlyValueTransactions: boolean;

    /**
     * Hide unconfirmed transactions.
     */
    showOnlyConfirmedTransactions: boolean;

    /**
     * Cursor for more items.
     */
    cursor?: ITransactionsCursor;
}
