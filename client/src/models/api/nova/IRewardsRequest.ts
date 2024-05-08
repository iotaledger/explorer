export interface IRewardsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The output id to get the rewards for.
     */
    outputId: string;

    /**
     * The slot index to use as 'up to' to get the rewards for (like when the output was spent).
     */
    slotIndex?: number;
}
