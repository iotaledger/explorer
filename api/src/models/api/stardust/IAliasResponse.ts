import { IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IAliasResponse extends IResponse {
    /**
     * The alias details response.
     */
    aliasDetails?: IOutputResponse;
}

