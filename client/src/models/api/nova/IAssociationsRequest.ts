import { IAddressDetails } from "./IAddressDetails";

export interface IAssociationsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The address details of the address to get the associated outputs for.
     */
    addressDetails: IAddressDetails;
}
