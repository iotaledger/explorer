import { OutputResponse } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../IResponse";

export interface INftDetailsResponse extends IResponse {
    /**
     * The nft details response.
     */
    nftDetails?: OutputResponse;
}
