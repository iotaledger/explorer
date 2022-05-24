export interface IBlockDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The message id to get the details for.
     */
    blockId: string;
}
