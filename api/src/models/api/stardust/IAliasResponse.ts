import { OutputResponse } from "@iota/sdk-stardust";
import { IResponse } from "./IResponse";

export interface IAliasResponse extends IResponse {
    /**
     * The alias details response.
     */
    aliasDetails?: OutputResponse;
}
