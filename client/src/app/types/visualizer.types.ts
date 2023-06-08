import Viva from "vivagraphjs";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { INodeData } from "../../models/graph/stardust/INodeData";

export type TSelectNode = ((node?: Viva.Graph.INode<INodeData, unknown>) => void);

export type TSelectFeedItem = (IFeedBlockData | null);

export interface IVisualizerHookReturn {
    toggleActivity: (() => void);
    selectNode: ((node?: Viva.Graph.INode<INodeData, unknown>) => void);
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    isActive: boolean;
    blocksCount: number;
    selectedFeedItem: (IFeedBlockData | null);
    isFormatAmountsFull: (boolean | null);
    setIsFormatAmountsFull: React.Dispatch<React.SetStateAction<boolean | null>>;
    lastClick: number | null;
}

export interface IVisualizerHookArgs {
    network: string;
    graphElement: React.MutableRefObject<HTMLDivElement | null>;
}
