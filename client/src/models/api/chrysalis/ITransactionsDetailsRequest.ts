export interface ITransactionsDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The address get the transactions for.
     */
    address: string;

    /**
     * The query parameters.
     */
     query?: { [key: string]: unknown };
}
