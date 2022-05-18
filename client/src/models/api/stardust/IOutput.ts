import { OutputTypes, TREASURY_OUTPUT_TYPE, BASIC_OUTPUT_TYPE, ALIAS_OUTPUT_TYPE, NFT_OUTPUT_TYPE, FOUNDRY_OUTPUT_TYPE } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../IBech32AddressDetails";

export interface IOutput {
    /**
     * The output id.
     */
    id: string;
    /**
     * The output type.
     */
    type: typeof TREASURY_OUTPUT_TYPE |
        typeof BASIC_OUTPUT_TYPE |
        typeof ALIAS_OUTPUT_TYPE |
        typeof FOUNDRY_OUTPUT_TYPE |
        typeof NFT_OUTPUT_TYPE;
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

