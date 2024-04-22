import { IOutputsResponse } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../IResponse";

export interface IFoundriesResponse extends IResponse {
    /**
     * The output ids response.
     */
    foundryOutputsResponse?: IOutputsResponse;
}
