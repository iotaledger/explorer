import { IOutputsResponse } from "@iota/iota.js-stardust/web";
import { IResponse } from "../../IResponse";

export interface INftOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}
