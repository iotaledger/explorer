import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IOutputDetailsResponse extends IResponse {
    /**
     * The output data.
     */
    output?: OutputWithMetadataResponse;
}
