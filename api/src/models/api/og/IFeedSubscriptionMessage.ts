import { IFeedTransaction } from "./IFeedTransaction";

export interface IFeedSubscriptionMessage {
    /**
     * The subscription id created.
     */
    subscriptionId: string;

    /**
     * The latest transactions.
     */
    transactions: IFeedTransaction[];

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
