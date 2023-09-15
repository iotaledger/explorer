import { OutputResponse } from "@iota/iota.js-stardust/web";
import { IResponse } from "../IResponse";

export interface IFoundryResponse extends IResponse {
    /**
     * The foundry details response.
     */
    foundryDetails?: OutputResponse;
}

