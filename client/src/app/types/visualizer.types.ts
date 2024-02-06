import Viva from "vivagraphjs";
import { IFeedBlockData as IFeedBlockDataStardust } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockData as IFeedBlockDataNova } from "../../models/api/nova/feed/IFeedBlockData";
import { INodeData } from "../../models/graph/stardust/INodeData";

export type TSelectNode = (node?: Viva.Graph.INode<INodeData, unknown>) => void;

export type TSelectFeedItem = IFeedBlockDataStardust | null;
export type TSelectFeedItemNova = IFeedBlockDataNova | null;
