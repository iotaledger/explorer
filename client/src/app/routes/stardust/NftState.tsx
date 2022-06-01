/* eslint-disable no-shadow */
import { INftOutput } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";

export interface NftState {
    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * The nft output.
     */
    output?: INftOutput;
}
