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
    })[];

    /**
     * The unlock addresses for the transactions.
     */
    unlockAddresses: IBech32AddressDetails[];
}
