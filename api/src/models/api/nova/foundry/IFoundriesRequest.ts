export interface IFoundriesRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The bech32 account address to get the foundy output ids for.
     */
    accountAddress: string;
}
