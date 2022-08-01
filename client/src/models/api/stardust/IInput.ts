import { IOutputResponse, IUTXOInput } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../IBech32AddressDetails";

interface IInputExtension {
    /**
     * The output id.
     */
    outputId: string;
    /**
     * The output used as input.
     */
    output?: IOutputResponse;
    /**
     * The transaction address details.
     */
    address: IBech32AddressDetails;
    /**
     * The amount.
     */
    amount: number;
    /**
     * The is genesis flag.
     */
    isGenesis: boolean;
}

export type IInput = IUTXOInput & IInputExtension;

