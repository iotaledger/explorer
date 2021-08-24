export interface IIdentityDIDHistoryRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The DID to be resolved.
     */
    did: string;
}
