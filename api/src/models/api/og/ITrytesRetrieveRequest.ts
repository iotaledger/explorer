export interface ITrytesRetrieveRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The hashes to look for.
     */
    hashes: string[];
}
