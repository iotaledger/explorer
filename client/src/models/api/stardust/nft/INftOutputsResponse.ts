import { IOutputsResponse } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../../IResponse";

export interface INftOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}
