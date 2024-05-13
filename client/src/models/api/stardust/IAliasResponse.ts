import { OutputResponse } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "./IResponse";

export interface IAliasResponse extends IResponse {
    /**
     * The alias details response.
     */
    aliasDetails?: OutputResponse;
}
