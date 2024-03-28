import { IOutputsResponse } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../../IResponse";

export interface IBasicOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}
