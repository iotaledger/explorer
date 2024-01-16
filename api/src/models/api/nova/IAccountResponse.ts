import { OutputResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IAccountResponse extends IResponse {
    /**
     * The account details response.
     */
    accountDetails?: OutputResponse;
}
