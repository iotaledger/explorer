export interface ITransactionDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The transaction id to get the details for.
     */
    transactionId: string;
}
