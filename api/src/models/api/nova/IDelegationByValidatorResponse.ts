/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IDelegationByValidatorResponse extends IResponse {
    /**
     * The delegation output by validator address.
     */
    outputs?: OutputWithMetadataResponse[];
}
