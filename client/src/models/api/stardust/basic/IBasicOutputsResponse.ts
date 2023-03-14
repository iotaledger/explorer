import { IOutputsResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../../IResponse";

export interface IBasicOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}

