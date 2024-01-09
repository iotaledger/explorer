import { IOutputsResponse } from "@iota/sdk";
import { IResponse } from "../../IResponse";

export interface IBasicOutputsResponse extends IResponse {
    /**
     * The output data.
     */
    outputs?: IOutputsResponse;
}
