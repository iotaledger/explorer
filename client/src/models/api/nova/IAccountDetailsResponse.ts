import { OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IAccountDetailsResponse extends IResponse {
    /**
     * The account details response.
     */
    accountOutputDetails?: OutputResponse;
}
