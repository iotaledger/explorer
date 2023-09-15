import { OutputResponse } from "@iota/iota.js-stardust/web";
import { IResponse } from "../IResponse";

export interface INftDetailsResponse extends IResponse {
    /**
     * The nft details response.
     */
    nftDetails?: OutputResponse;
}

