import { IFeedBlockData } from "../../api/nova/feed/IFeedBlockData";

export interface INodeData {
    /**
     * The feed item.
     */
    feedItem: IFeedBlockData;

    /**
     * When was the node added.
     */
    added: number;

    /**
     * The graph number.
     */
    graphId?: number;
}
