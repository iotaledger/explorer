import { IOutputsResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IFoundriesResponse extends IResponse {
    /**
     * The output ids response.
     */
    foundryOutputsResponse?: IOutputsResponse;
}
