// @ts-nocheck
// import { default as useResizeObserver } from "@react-hook/resize-observer";
import Konva from "konva";
import React, { useState, useEffect, useRef, useMemo } from "react";

import { Stage, Layer, Circle, Line } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { Updates } from "../common/Nodes";
import { useUpdateListener } from "../common/useUpdateListener";
import { placeNodeCallback, THRESHOLD_PX } from "../vivagraph-layout/layout";
import { LIMIT_NODES, colors, DEFAULT_SIZE, INCREASE_SIZE } from "./constants";
import { useDrag } from "./useDrag";
import { useInit } from "./useInit";
import { useYCoordinateGenerator } from "./usePlaceNodes";
import { useShift } from "./useShift";
import { useStoreIds } from "./useStoreIds";
import { useZoom } from "./useZoom";
import "./nodePosition";

interface ParentNode {
    id: number;
    x: number;
    y: number;
}

// interface Node {
//     id: number;
//     x: number;
//     y: number;
//     parents: ParentNode[];
// }

interface GraphProps {
    nodes: Node[];
}

export const VisualizerKanva: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
    /**
     * References
     */
    const stageRef = useRef<Konva.Stage>(null);
    const nodesLayerRef = useRef<Konva.Layer>(null);
    const linesLayerRef = useRef<Konva.Layer>(null);
    const lastNodePositionRef = useRef<number>(0);
    const nodeMap = useRef<Map<string, Konva.Circle & { size: number }>>(
        new Map()
    );
    const linesMap = useRef<string[]>([]);
    const parentNodesList = useRef<string[]>([]);
    const graphShiftCountRef = useRef<number>(0);

    /**
     * Custom hooks
     */

    const { divWrapRef, isInit, stageHeight, stageWidth } = useInit(stageRef);

    const [networkConfig] = useNetworkConfig(network);

    const { handleWheel, recalculateZoom } = useZoom({ stageRef });
    const { handleMouseMove, handleMouseUp, handleMouseDown, shiftGraphRight } =
        useDrag(stageRef, nodesLayerRef, linesLayerRef, lastNodePositionRef);
    const { removeFirstNodeFromLayer, storeAddBlock, getNumberOfNodes } =
        useStoreIds();
    const { generateY, resetY } = useYCoordinateGenerator();
    const { generateX } = useShift({
        stageRef,
        nodesLayerRef,
        linesLayerRef,
        nodeMap,
        graphShiftCountRef,
        resetY
    });

    const onNewBlock = (block: IFeedBlockData) => {
        if (nodesLayerRef.current) {
            workerRef.current.postMessage({ type: "add", data: block });
            // console.log("--- block", block);
            // const { y } = placeNodeCallback(graphShiftCountRef.current);

            return;
            const y = generateY();
            const x = generateX();

            recalculateZoom(y);

            // lastNodePositionRef.current += 1;
            storeAddBlock(block.blockId);

            if (getNumberOfNodes() > LIMIT_NODES) {
                removeFirstNodeFromLayer(nodesLayerRef.current, linesMap);
            }

            // Store the Konva node in the nodeMap
            parentNodesList.current.push(block.blockId);
            nodeMap.current.set(block.blockId, {
                x,
                y,
                size: DEFAULT_SIZE
            });

            if (parentNodesList.current.length > 200) {
                const firstParent = parentNodesList.current.shift();
                nodeMap.current.delete(firstParent);
            }

            for (const parent of block.parents) {
                const parentKonvaNode = nodeMap.current.get(parent);
                if (parentKonvaNode) {
                    const newRadius = parentKonvaNode.size + INCREASE_SIZE;

                    nodeMap.current.set(parent, {
                        ...parentKonvaNode,
                        size: newRadius
                    });

                    const parentNodeOnLayer = nodesLayerRef.current.findOne(
                        `#${parent}`
                    );
                    if (parentNodeOnLayer) {
                        parentNodeOnLayer.radius(newRadius); // Adjust the base radius and the multiplier as needed
                        parentNodeOnLayer.draw(); // Redraw the node
                    }
                }
            }

            newNode.on("click", (e) => {
                console.log("click", e);
            });

            // now we need to refresh the layer manually

            // linesLayerRef.current.batchDraw();
        }
    };

    useUpdateListener(network, onNewBlock);

    const workerRef = useRef(null);

    const handleAddNodes = (n: Node[]) => {
        if (!nodesLayerRef.current) {
            return;
        }
        const random = Math.floor(Math.random() * colors.length);

        for (const node of n) {
            const konvaNode = new Konva.Circle({
                x: node.x,
                y: node.y,
                radius: DEFAULT_SIZE,
                fill: colors[random],
                id: node.id
            });
            nodesLayerRef.current.add(konvaNode);
        }
    };

    const onWorkerMessage = (event: MessageEvent<Updates>) => {
        const { add, modify, remove } = event.data;

        handleAddNodes(add);

        nodesLayerRef.current.batchDraw();
        console.log("Message received from worker", event.data);
    };

    useEffect(() => {
        workerRef.current = new Worker(
            new URL("nodePosition.ts", import.meta.url)
        );
        workerRef.current.postMessage(null);

        workerRef.current.addEventListener("message", onWorkerMessage);
    }, []);

    return (
        <Wrapper
            blocksCount={0}
            filter=""
            isActive={false}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={() => {}}
            selectNode={() => {}}
            selectedFeedItem={null}
            toggleActivity={() => {}}
        >
            <div
                ref={divWrapRef}
                style={{ width: "100%", height: "100%", minHeight: 600 }}
            >
                <Stage
                    // onWheel={handleWheel}
                    // draggable
                    // onMouseDown={handleMouseDown}
                    // onMouseUp={handleMouseUp}
                    // onMouseMove={handleMouseMove}
                    ref={stageRef}
                >
                    <Layer ref={nodesLayerRef} />
                </Stage>
            </div>
        </Wrapper>
    );
};

export default VisualizerKanva;
