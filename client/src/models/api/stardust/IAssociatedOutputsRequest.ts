import { IBech32AddressDetails } from "../IBech32AddressDetails";

export interface IAssociatedOutputsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The address details of the address to get the associated outputs for.
     */
    addressDetails: IBech32AddressDetails;
}
