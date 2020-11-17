import { IFeedItem } from "../IFeedItem";

export interface INodeData {
    /**
     * The feed item.
     */
    feedItem: IFeedItem;

    /**
     * When was the node added.
     */
    added: number;

    /**
     * The graph number.
     */
    graphId?: number;
}
