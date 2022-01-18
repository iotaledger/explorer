export interface IIdentityDidHistoryRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The DID to be resolved.
     */
    did: string;

    /**
     * version of did implementation
     */
    version: string;
}
