export interface IMilestoneBlocksRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The milestone to get the stats for.
     */
    milestoneId: string;
}
