import { ICachedTransaction } from "../../models/ICachedTransaction";
import { CurrencyState } from "../components/CurrencyState";

export interface AddressState extends CurrencyState {
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
     * The address balance.
     */
    balanceIota: string;

    /**
     * The address balance.
     */
    balanceCurrency: string;
}
