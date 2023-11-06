import { OutputResponse } from "@iota/sdk-wasm/web";
import { IResponse } from "../../IResponse";

export interface IAddressDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: OutputResponse[];
}
