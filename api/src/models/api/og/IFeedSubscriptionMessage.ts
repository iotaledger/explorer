import { IFeedItemChrysalis } from "./IFeedItemChrysalis";
import { IFeedItemOg } from "./IFeedItemOg";

export interface IFeedSubscriptionMessage {
    /**
     * The subscription id created.
     */
    subscriptionId: string;

    /**
     * The latest transactions.
     */
    items: (IFeedItemOg | IFeedItemChrysalis)[];

    /**
     * The confirmed transactions.
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
