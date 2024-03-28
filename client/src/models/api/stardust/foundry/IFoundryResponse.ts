import { OutputResponse } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../IResponse";

export interface IFoundryResponse extends IResponse {
    /**
     * The foundry details response.
     */
    foundryDetails?: OutputResponse;
}
