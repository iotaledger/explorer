import { IAddressResponse, IOutputResponse } from "@iota/iota.js";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { MessageTangleStatus } from "../../../models/messageTangleStatus";

export interface AddrState {
    /**
     * Address.
     */
    address?: IAddressResponse;

    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * The address balance.
     */
    balance?: number;

    /**
     * Is the component status busy.
     */
    statusBusy: boolean;

    /**
     * The status.
     */
    status: string;

    /**
     * The output ids for the address.
     */
    outputIds?: string[];

    /**
     * The outputs for the address.
     */
    outputs?: IOutputResponse[];

    /**
     * The received amount.
     */
    received: number;

    /**
     * The total sent amount.
     */
    sent: number;

    /**
     * The historic output ids for the address.
     */
    historicOutputIds?: string[];

    /**
     * The historic outputs for the address.
     */
    historicOutputs?: IOutputResponse[];

    /**
     * Format the amount in full.
     */
    formatFull: boolean;

    /**
     * Value of the transaction filter.
     */
    filterValue: "all" | "incoming" | "outgoing";

    transactions?: {
        messageId: string;
        inputs: number;
        outputs: number;
        messageTangleStatus: MessageTangleStatus;
        date: string;
        amount: number;
        isSpent: boolean;
    }[];
}
