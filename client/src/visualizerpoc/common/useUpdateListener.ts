import { useEffect, useState } from "react";
import { IVisualizerHookArgs } from "../../app/types/visualizer.types";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";

interface IGraphNode extends IFeedBlockData {
    id: string;
}

export const useUpdateListener = (network: IVisualizerHookArgs["network"], handlerNewBlock?: (newBlock: IFeedBlockData) => void) => {
    const [nodes, setNodes] = useState<{list: IGraphNode[]; map: {[k: string]: IGraphNode}}>({ list: [], map: {} });

    const onNewBlockData = (newBlock: IFeedBlockData) => {
        setNodes(prev => {
            const newBlockWithId = { ...newBlock, id: newBlock.blockId };
            const newList = [...prev.list, newBlockWithId];
            const newMap = { ...prev.map, [newBlockWithId.blockId]: newBlockWithId };
            return { list: newList, map: newMap };
        });
    };

    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        if (feedService) {
            feedService.subscribeBlocks(handlerNewBlock ?? onNewBlockData, () => {});
        }
    }, []);
    return {
        nodes
    };
};
