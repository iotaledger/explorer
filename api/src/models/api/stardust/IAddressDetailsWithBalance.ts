import { BigInteger } from "big-integer";

/**
 * Address details with balance info.
 */
 export default interface IAddressDetailsWithBalance {
    /**
     * The hex for the address the details are for.
     */
    hex?: string;

    /**
     * The bech32 for the address the details are for.
     */
    bech32?: string;

    /**
     * The address type
     */
    type?: number;

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

