import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IOutputDetailsResponse extends IResponse {
    /**
     * The output data.
     */
    output?: OutputWithMetadataResponse;
}
