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
     * The total number of hashes.
     */
    totalCount?: string;

    /**
     * The items exceeded the limit.
     */
    limitExceeded?: boolean;

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
    formatFull: boolean;
}
