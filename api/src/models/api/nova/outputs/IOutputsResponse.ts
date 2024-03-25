/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OutputsResponse } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

export interface IOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: OutputsResponse;
}
