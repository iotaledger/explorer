/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OutputResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";
import { IRewardsResponse } from "./IRewardsResponse";

export interface IDelegationDetailsResponse extends IResponse {
    /**
     * The outputs data.
     */
    outputs?: { output: OutputResponse & IRewardsResponse }[];
}
