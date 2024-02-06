/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OutputResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IAccountDetailsResponse extends IResponse {
    /**
     * The account details response.
     */
    accountOutputDetails?: OutputResponse;
}
