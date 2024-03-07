/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IOutputDetailsResponse extends IResponse {
    /**
     * The output data.
     */
    output?: OutputWithMetadataResponse;
}
