import { IResponse } from "./IResponse";
import { IRewardsResponse } from "./IRewardsResponse";

export interface IDelegationDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: IRewardsResponse[];
}
