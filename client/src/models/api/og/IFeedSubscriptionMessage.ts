export interface IFeedSubscriptionMessage {
    /**
     * The subscription id created.
     */
    subscriptionId: string;

    /**
     * The latest items.
     */
    items: string[];

    /**
     * The confirmed items.
     */
    confirmed: string[];

    /**
     * The ips data.
     */
    ips: {
        /**
         * The start timestamp for the ips.
         */
        start: number;

        /**
         * The end timestamp for the ips.
         */
        end: number;

        /**
         * The item counts.
         */
        itemCount: number[];

        /**
         * The confirmed item counts.
         */
        confirmedItemCount: number[];
    };
}
