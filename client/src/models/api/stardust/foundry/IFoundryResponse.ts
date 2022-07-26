import { IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../../IResponse";

export interface IFoundryResponse extends IResponse {
    /**
     * The foundry details response.
     */
    foundryDetails?: IOutputResponse;
}

