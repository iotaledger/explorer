export interface ITransactionsUnsubscribeRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The subscription id to unsubscribe.
     */
    subscriptionId: string;
}
