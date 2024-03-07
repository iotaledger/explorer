import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IAddressDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: OutputWithMetadataResponse[];
}
