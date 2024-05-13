export interface IEpochCommitteeRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The epoch index to get the committee for.
     */
    epochIndex: string;
}
