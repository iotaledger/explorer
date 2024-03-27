import { IOutputsResponse } from "@iota/sdk-stardust";
import { IResponse } from "../../IResponse";

export interface INftOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}
