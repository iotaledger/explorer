/* eslint-disable no-shadow */
import { IOutputResponse } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";

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
     * The outputs for the address.
     */
    outputResponse?: IOutputResponse[];

    /**
     * Format the amount in full.
     */
    formatFull: boolean;

    /**
     * Number of NFTs owned by the address.
     */
    nftsCount?: number;
}

