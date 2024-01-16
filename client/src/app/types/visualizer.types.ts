import Viva from "vivagraphjs";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { INodeData } from "../../models/graph/stardust/INodeData";

export type TSelectNode = (node?: Viva.Graph.INode<INodeData, unknown>) => void;

export type TSelectFeedItem = IFeedBlockData | null;
