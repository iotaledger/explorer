import { OutputResponse } from "@iota/iota.js-stardust/web";
import { IResponse } from "./IResponse";

export interface IAliasResponse extends IResponse {
    /**
     * The alias details response.
     */
    aliasDetails?: OutputResponse;
}

