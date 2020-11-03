import { IResponse } from "../IResponse";

export interface IAddressGetResponse extends IResponse {
    /**
     * The balance for the address.
     */
    balance?: number;
}
