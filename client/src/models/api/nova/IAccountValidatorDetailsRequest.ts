export interface IAccountValidatorDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The account id to get the validator details for.
     */
    accountId: string;
}
