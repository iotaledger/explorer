import { IFeedItemMetadata } from "./IFeedItemMetadata";

export interface IFeedSubscriptionItem {
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
