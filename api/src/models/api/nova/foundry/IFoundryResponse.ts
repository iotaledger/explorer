import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

export interface IFoundryResponse extends IResponse {
    /**
     * The foundry details response.
     */
    foundryDetails?: OutputWithMetadataResponse;
}
