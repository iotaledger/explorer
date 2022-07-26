import { IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../../IResponse";

export interface INftAddressDetailsResponse extends IResponse {
    /**
     * The nft address details response.
     */
    nftAddressDetails?: IOutputResponse;
}

