import { IResponse } from "../IResponse";
import { IOutputsResponse } from "@iota/iota.js-stardust";

export interface INftOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}
