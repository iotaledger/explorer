export interface ITransactionsSubscriptionMessage {
    /**
     * The subscription id created.
     */
    subscriptionId: string;

    /**
     * The latest transactions.
     */
    transactions: { [hash: string]: number };

    /**
     * The tps counts.
     */
    tps: number[];

    /**
     * The interval for the tps data.
     */
    tpsInterval: number;
}
