export interface IEpochStatsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The epoch index to get the stats for.
     */
    epochIndex: string;
}
