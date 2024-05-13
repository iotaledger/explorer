import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IAnchorDetailsResponse extends IResponse {
    /**
     * The anchor details response.
     */
    anchorOutputDetails?: OutputWithMetadataResponse;
}
