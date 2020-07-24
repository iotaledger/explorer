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
     * The start timestamp for the tps.
     */
    tpsStart: number;

    /**
     * The end timestamp for the tps.
     */
    tpsEnd: number;

    /**
     * The tps counts.
     */
    tps: number[];
}
