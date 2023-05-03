export interface IBlockDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The block id to get the details for.
     */
    blockId: string;
}
