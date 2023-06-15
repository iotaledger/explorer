import { OutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IAddressDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: OutputResponse[];
}
