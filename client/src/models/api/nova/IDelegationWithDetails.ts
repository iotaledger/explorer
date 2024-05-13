import { OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IRewardsResponse } from "./IRewardsResponse";

export interface IDelegationWithDetails {
    /**
     * The output.
     */
    output: OutputWithMetadataResponse;

    /**
     * The rewards for the output.
     */
    rewards?: IRewardsResponse;
}
