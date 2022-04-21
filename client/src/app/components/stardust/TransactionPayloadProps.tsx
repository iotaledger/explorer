import { IUTXOInput, IOutputResponse, OutputTypes} from "@iota/iota.js-stardust";
import * as H from "history";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
export interface TransactionPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The unlock addresses for the transactions.
     */
    inputs: (IUTXOInput & {
        outputHash: string;
        isGenesis: boolean;
        transactionUrl: string;
        transactionAddress: IBech32AddressDetails;
        signature: string;
        publicKey: string;
        amount: number;
    })[];

    /**
     * The outputs.
     */
    outputs: {
        index: number; 
        type: 2 | 3 | 4 | 5 | 6; 
        id?: string;
        output: OutputTypes;
        amount: number;
    }[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal: number;

    /**
     * History for navigation.
     */
    history: H.History;
}
