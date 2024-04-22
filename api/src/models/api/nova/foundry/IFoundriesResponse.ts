import { OutputsResponse } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

export interface IFoundriesResponse extends IResponse {
    /**
     * The output ids response.
     */
    foundryOutputsResponse?: OutputsResponse;
}
