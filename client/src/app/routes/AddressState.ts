import { ICachedTransaction } from "../../models/ICachedTransaction";

export interface AddressState {
    /**
     * The address.
     */
    address?: string;

    /**
     * The address checksum.
     */
    checksum?: string;

    /**
     * The address balance.
     */
    balance?: number;

    /**
     * Transaction hashes for the address.
     */
    items?: {
        /**
         * The transaction hash.
         */
        hash: string;

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
        hash: string;

        /**
         * The details details.
         */
        details?: ICachedTransaction;
    }[];

    /**
     * The items exceeded the limit.
     */
    limitExceeded?: boolean;

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
     * Cursor next request.
     */
    cursor?: string;
}
