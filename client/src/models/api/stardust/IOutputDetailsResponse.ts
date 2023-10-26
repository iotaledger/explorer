import { OutputResponse } from "@iota/sdk-wasm/web";
import { IResponse } from "./IResponse";

export interface IOutputDetailsResponse extends IResponse {
    /**
     * The output data.
     */
    output?: OutputResponse;
}
