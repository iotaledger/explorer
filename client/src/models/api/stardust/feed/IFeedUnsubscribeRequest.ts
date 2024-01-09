import { IFeedSelect } from "./IFeedSubscribeRequest";

export interface IFeedUnsubscribeRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The subscription id to unsubscribe.
     */
    subscriptionId: string;

    /**
     * The specific feed to subscribe too (expected only on stardust feed).
     */
    feedSelect: IFeedSelect;
}
