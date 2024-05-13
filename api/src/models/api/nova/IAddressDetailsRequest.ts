export interface IAddressDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The bech32 address to get the basic output ids for.
     */
    address: string;
}
