export interface IIdentityDiffHistoryRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The integration messageId of which the diff history should be resolved.
     */
    integrationMsgId: string;

    /**
     * version of DID implementation
     */
    version: string;
}
