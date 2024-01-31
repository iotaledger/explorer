/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ManaRewardsResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface IRewardsResponse extends IResponse {
    /**
     * The output Id.
     */
    outputId: string;

    /**
     * The output mana rewards.
     */
    manaRewards?: ManaRewardsResponse;
}
