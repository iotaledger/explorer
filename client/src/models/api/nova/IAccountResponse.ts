import { OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IAccountResponse extends IResponse {
    /**
     * The account details response.
     */
    accountDetails?: OutputResponse;
}
