import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IAnchorDetailsResponse extends IResponse {
    /**
     * The anchor details response.
     */
    anchorOutputDetails?: OutputWithMetadataResponse;
}
