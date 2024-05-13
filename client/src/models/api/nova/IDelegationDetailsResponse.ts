import { IResponse } from "./IResponse";
import { IDelegationWithDetails } from "./IDelegationWithDetails";

export interface IDelegationDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: IDelegationWithDetails[];
}
