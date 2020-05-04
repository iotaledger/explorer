import { ICachedTransaction } from "../../models/ICachedTransaction";

export interface AddressState {
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
    statusBusy: boolean;

    /**
     * The status.
     */
    status: string;

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
     * Format the iota in full.
     */
    formatFull?: boolean;

    /**
     * Hide zero transactions.
     */
    showOnlyValueTransactions: boolean;

    /**
     * Total text.
     */
    totalText?: string;
}
