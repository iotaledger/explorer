import { HexEncodedString, OutputResponse } from "@iota/sdk-wasm-stardust/web";
import { IBech32AddressDetails } from "../IBech32AddressDetails";

export interface IInput {
    /**
     * The transaction Id.
     */
    transactionId: HexEncodedString;
    /**
     * The input index.
     */
    transactionInputIndex: number;
    /**
     * The output id.
     */
    outputId: string;
    /**
     * The output used as input.
     */
    output?: OutputResponse;
    /**
     * The transaction address details.
     */
    address: IBech32AddressDetails;
    /**
     * The amount.
     */
    amount?: number;
    /**
     * The is genesis flag.
     */
    isGenesis: boolean;
}
