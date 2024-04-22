import { CongestionResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface ICongestionResponse extends IResponse {
    /**
     * The Account Congestion.
     */
    congestion?: CongestionResponse;
}
