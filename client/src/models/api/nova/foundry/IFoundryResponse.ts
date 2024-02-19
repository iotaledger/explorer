import { OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IFoundryResponse extends IResponse {
    /**
     * The foundry details response.
     */
    foundryDetails?: OutputResponse;
}
