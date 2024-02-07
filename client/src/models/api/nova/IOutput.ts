import { Output } from "@iota/sdk-wasm-nova/web";
import { IAddressDetails } from "./IAddressDetails";

export interface IOutput {
    /**
     * The output id.
     */
    id: string;
    /**
     * The Bech32 address details.
     */
    address?: IAddressDetails;
    /**
     * The output.
     */
    output: Output;
    /**
     * The output amount.
     */
    amount: number;
    /**
     * Is remainder output flag.
     */
    isRemainder?: boolean;
}
