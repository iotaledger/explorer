/* eslint-disable no-shadow */
import { IOutputResponse } from "@iota/iota.js-stardust";
import { IBech32AddressDetails } from "../../../models/api/IBech32AddressDetails";

export interface AddressPageState {
    /**
     * The addres in bech 32 format.
     */
    bech32AddressDetails?: IBech32AddressDetails;

    /**
     * The total balance (including Expiration, Timelock and StorageDepositReturn outputs)
     */
    balance?: number;

    /**
     * The balance of trivialy unlockable outputs with address unlock condition.
     */
    sigLockedBalance?: number;

    /**
     * The outputs for the address.
     */
    outputResponse?: IOutputResponse[];

    /**
     * Number of NFTs owned by the address.
     */
    nftsCount?: number;
}

