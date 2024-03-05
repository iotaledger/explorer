/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IRewardsResponse } from "./IRewardsResponse";

export interface IDelegationWithDetails {
    /**
     * The output.
     */
    output: OutputWithMetadataResponse;

    /**
     * The rewards for the output.
     */
    rewards: IRewardsResponse;
}
