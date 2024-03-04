import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface INftDetailsResponse extends IResponse {
    /**
     * The nft output details response.
     */
    nftOutputDetails?: OutputWithMetadataResponse;
}
