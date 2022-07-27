import { IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../../IResponse";

export interface INftDetailsResponse extends IResponse {
    /**
     * The nft details response.
     */
    nftDetails?: IOutputResponse;
}

