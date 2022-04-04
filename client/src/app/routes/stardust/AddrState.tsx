/* eslint-disable no-shadow */
import { IOutputResponse } from "@iota/iota.js-stardust";
import IAddressDetails from "../../../models/api/stardust/IAddressDetails";
import { ITransaction, ITransactionsDetailsResponse } from "../../../models/api/stardust/ITransactionsDetailsResponse";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";


export interface AddrState {
    /**
     * Address.
     */
    address?: string;

    /**
     * The Address Details.
     */
    addressDetails?: IAddressDetails;

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
     * List of transactions of an address.
     */
    transactionHistory?: ITransactionsDetailsResponse;

    /**
     * Current page in transaction history table.
     */
    currentPage: number;

    /**
     * Page size in transaction history table.
     */
    pageSize: number;

    /**
     * Page size in transaction history table.
     */
     currentPageTransactions: ITransaction[];
}

