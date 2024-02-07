/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OutputResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IAnchorDetailsResponse extends IResponse {
    /**
     * The anchor details response.
     */
    anchorOutputDetails?: OutputResponse;
}
