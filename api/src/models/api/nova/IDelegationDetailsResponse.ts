import { IDelegationWithDetails } from "./IDelegationWithDetails";
import { IResponse } from "./IResponse";

export interface IDelegationDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: IDelegationWithDetails[];
}
