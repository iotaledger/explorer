import { IFeedItem } from "../IFeedItem";

export interface INodeData {
    /**
     * The feed item.
     */
    feedItem: IFeedItem;

    /**
     * Is the transaction confirmed.
     */
    confirmed?: boolean;
}
