import { IOutputsResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IFoundriesResponse extends IResponse {
    /**
     * The output ids response.
     */
    foundryOutputsResponse?: IOutputsResponse;
}
