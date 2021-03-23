import { IAddressResponse, IOutputResponse } from "@iota/iota.js";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";

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
     * Display advanced mode.
     */
     advancedMode: boolean;
}
