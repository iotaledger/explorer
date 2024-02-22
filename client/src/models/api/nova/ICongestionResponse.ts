/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CongestionResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface ICongestionResponse extends IResponse {
    /**
     * The Account Congestion.
     */
    congestion?: CongestionResponse;
}
