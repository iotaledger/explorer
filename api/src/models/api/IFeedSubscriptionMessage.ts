import { IFeedItemMetadata } from "./IFeedItemMetadata";

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
     * The items metadata.
     */
    itemsMetadata: {
        [id: string]: IFeedItemMetadata;
    };
}
