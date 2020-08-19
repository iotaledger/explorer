export interface IFeedSubscriptionMessage {
    /**
     * The subscription id created.
     */
    subscriptionId: string;

    /**
     * The latest transactions.
     */
    transactions: {
        [hash: string]: {
            /**
             * The trunk.
             */
            trunk: string;
            /**
             * The branch.
             */
            branch: string;
            /**
             * The transaction value.
             */
            value: number;
        };
    };

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
