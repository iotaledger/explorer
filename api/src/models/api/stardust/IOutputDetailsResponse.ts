import { IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "./IResponse";

export interface IOutputDetailsResponse extends IResponse {
    /**
     * The output data.
     */
    output?: IOutputResponse;
}
