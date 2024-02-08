import { HexEncodedString, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "./IAddressDetails";

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
    address: IAddressDetails;
    /**
     * The amount.
     */
    amount?: number;
    /**
     * The is genesis flag.
     */
    isGenesis: boolean;
}
