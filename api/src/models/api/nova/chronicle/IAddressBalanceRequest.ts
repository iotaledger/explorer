export interface IAddressBalanceRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The bech32 address to get the balance for.
     */
    address: string;
}
