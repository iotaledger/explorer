import { CongestionResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface ICongestionResponse extends IResponse {
    /**
     * The Account Congestion.
     */
    congestion?: CongestionResponse;
}
