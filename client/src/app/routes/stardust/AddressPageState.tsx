/* eslint-disable no-shadow */
import { IOutputResponse } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import INftDetails from "./INftDetails";

export interface AddressPageState {
    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * The address balance.
     */
    balance?: number;

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
    outputResponse?: IOutputResponse[];

    /**
     * Format the amount in full.
     */
    formatFull: boolean;

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

