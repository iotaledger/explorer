export interface IAssociationsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The address to get the associated outputs for.
     */
    address: string;
}
