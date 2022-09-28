export interface INftRegistryDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The address to get the nft details for.
     */
    nftId: string;
}
