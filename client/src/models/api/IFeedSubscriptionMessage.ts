export interface IFeedSubscriptionMessage {
    /**
     * The subscription id created.
     */
    subscriptionId: string;

    /**
     * The latest transactions.
     */
    transactions: {
        /**
         * The hash.
         */
        hash: string;
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
    }[];

    /**
     * The confirmed transactions.
     */
    confirmed: string[];

    /**
     * The tps data.
     */
    tps: {
        /**
         * The start timestamp for the tps.
         */
        start: number;

        /**
         * The end timestamp for the tps.
         */
        end: number;

        /**
         * The tps counts.
         */
        tx: number[];

        /**
         * The confirmed tps counts.
         */
        sn: number[];
    };
}
