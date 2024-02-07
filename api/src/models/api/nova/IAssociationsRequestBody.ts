import { IAddressDetails } from "./IAddressDetails";

export interface IAssociationsRequestBody {
    /**
     * The address details of the address to get the associated outputs for.
     */
    addressDetails: IAddressDetails;
}
