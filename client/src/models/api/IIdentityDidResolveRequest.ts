
export interface IIdentityDidResolveRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The DID to be resolved.
     */
    did: string;
}
