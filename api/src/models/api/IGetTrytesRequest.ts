export interface IGetTrytesRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The hashes to look for.
     */
    hashes: string[];
}
