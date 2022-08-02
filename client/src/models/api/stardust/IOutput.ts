import { OutputTypes } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../IBech32AddressDetails";

export interface IOutput {
    /**
     * The output id.
     */
    id: string;
    /**
     * The Bech32 address details.
     */
    address?: IBech32AddressDetails;
    /**
     * The output.
     */
    output: OutputTypes;
    /**
     * The output amount.
     */
    amount: number;
    /**
     * Is remainder output flag.
     */
    isRemainder?: boolean;
}

