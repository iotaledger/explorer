import { IBech32AddressDetails } from "./IBech32AddressDetails";

export interface IAssociationsRequestBody {
    /**
     * The address details of the address to get the associated outputs for.
     */
    addressDetails: IBech32AddressDetails;
}

