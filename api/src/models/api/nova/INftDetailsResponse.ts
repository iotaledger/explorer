import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface INftDetailsResponse extends IResponse {
    /**
     * The nft output details response.
     */
    nftOutputDetails?: OutputWithMetadataResponse;
}
