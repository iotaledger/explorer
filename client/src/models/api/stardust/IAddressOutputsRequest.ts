export interface IAddressOutputsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The bech32 address to get the unspent output ids for.
     */
    address: string;
}

