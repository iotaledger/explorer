import React, { useEffect } from "react";
import { GraphCanvasRef } from "reagraph";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";

export const useVisualizerReagraph = (refGraph: React.RefObject<GraphCanvasRef>) => {
    const addNode = (node: IFeedBlockData) => {
        // const graphRefInternal = refGraph.current?.getGraph();
        // if (!graphRefInternal) {
        //     return;
        // }


        // console.log("---", node.blockId);
        // graphRefInternal.addNode(node.blockId, {
        //     feedItem: node,
        //     added: new Date()
        // });
        // refGraph.current?.addNode({
        //     id: node.blockId,
        //     data: node
        // });
    };

    const onNewBlockData = (newBlock: IFeedBlockData) => {
        addNode(newBlock);
    };

    useEffect(() => {
        // @ts-expect-error property
        window.refGraph = refGraph;
    }, [refGraph]);

    return { onNewBlockData };
};
