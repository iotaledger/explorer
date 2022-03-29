import { AddressTypes } from "@iota/iota.js";
import { BigInteger } from "big-integer";
/**
 * Address details.
 */
 export default interface IAddressDetails {
    /**
     * The address the details are for.
     */
    address?: string;

    /**
     * The address type
     */
    type?: AddressTypes;

    /**
     * The balance of the address.
     */
    balance: BigInteger;

    /**
     * Nativ tokens.
     */
    nativeTokens: {
        [id: string]: BigInteger;
    };

    /**
     * The ledger index at which these outputs where available at.
     */
    ledgerIndex: number;
}

