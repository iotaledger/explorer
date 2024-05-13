import { ManaRewardsResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IRewardsResponse extends IResponse {
    /**
     * The output Id.
     */
    outputId?: string;

    /**
     * The output mana rewards.
     */
    manaRewards?: ManaRewardsResponse;
}
