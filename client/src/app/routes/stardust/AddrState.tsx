/* eslint-disable no-shadow */
import { IOutputResponse } from "@iota/iota.js-stardust";
import IAddressDetails from "../../../models/api/stardust/IAddressDetails";
import { ITransaction, ITransactionsDetailsResponse } from "../../../models/api/stardust/ITransactionsDetailsResponse";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import INftDetails from "./INftDetails";
import ITokenDetails from "./ITokenDetails";

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
     * Are the component native tokens loading.
     */
    areTokensLoading: boolean;

    /**
     * Are the component NFTs loading.
     */
    areNftsLoading: boolean;

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
     * Current page number in transaction history table.
     */
    transactionsPageNumber: number;

    /**
     * Page size in transaction history table.
     */
    transactionsPageSize: number;

    /**
     * Current page in transaction history table.
     */
    transactionsPage: ITransaction[];

    /**
     * List of native tokens of the address.
     */
    tokens?: ITokenDetails[];

    /**
     * Current page number in native tokens table.
     */
    tokensPageNumber: number;

    /**
     * Current page in tokens table.
     */
    tokensPage: ITokenDetails[];

    /**
     * List of nfts of the address.
     */
    nfts?: INftDetails[];

    /**
     * Current page number in nft history table.
     */
    nftsPageNumber: number;

    /**
     * Current page in nft history table.
     */
    nftsPage: INftDetails[];
}

