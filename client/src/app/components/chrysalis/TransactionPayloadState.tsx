import { IUTXOInput } from "@iota/iota.js";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";

export interface TransactionPayloadState {
    /**
     * Format the curreny in full.
     */
    formatFull?: boolean;

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
    })[];

    /**
     * The outputs.
     */
    outputs: {
        index: number;
        type: number;
        address: IBech32AddressDetails;
        amount: number;
        isRemainder: boolean;
    }[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal: number;

    /**
     * The unlock addresses for the transactions.
     */
    unlockAddresses: IBech32AddressDetails[];

    /**
     * Shows details of the specified input id
     */
    showDetails: number;
}
