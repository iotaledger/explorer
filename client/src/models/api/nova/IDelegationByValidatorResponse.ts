import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IDelegationByValidatorResponse extends IResponse {
    /**
     * The delegation output by validator address.
     */
    outputs?: OutputWithMetadataResponse[];
}
