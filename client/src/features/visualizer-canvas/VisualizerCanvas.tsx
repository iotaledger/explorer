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
import { useInit } from "./hooks/useInit";
import { useYCoordinateGenerator } from "./hooks/usePlaceNodes";
import { useShift } from "./hooks/useShift";
import { useStoreIds } from "./hooks/useStoreIds";
import { useUpdateListener } from "./hooks/useUpdateListener";
import { useZoom } from "./hooks/useZoom";
import {
    colors,
    LIMIT_NODES,
    DEFAULT_SIZE,
    INCREASE_SIZE
} from "./lib/constants";
import { Updates, WorkerNode, ZoomY } from "./lib/Nodes";
import "./worker";

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

export const VisualizerCanvas: React.FC<
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

    const { recalculateZoom } = useZoom({ stageRef });

    const onNewBlock = (block: IFeedBlockData) => {
        if (nodesLayerRef.current) {
            block.timestamp = Date.now();

            workerRef.current.postMessage({
                type: "add",
                graphShift: graphShiftCountRef.current,
                data: block
            });
        }
    };

    useUpdateListener(network, onNewBlock);

    const workerRef = useRef(null);

    const handleAddNode = (node: WorkerNode) => {
        const konvaNode = new Konva.Circle({
            x: node.x,
            y: node.y,
            radius: node.radius ?? DEFAULT_SIZE,
            fill: node.color,
            id: node.id
        });

        konvaNode.on("click", (e) => {
            console.log("click", e);
        });

        nodesLayerRef.current.add(konvaNode);
    };

    /**
     * Add node to chart
     * @param workerNodes - node to add
     */
    const handleAddNodes = (workerNodes: WorkerNode[]) => {
        if (!nodesLayerRef.current) {
            return;
        }

        for (const node of workerNodes) {
            handleAddNode(node);
        }
    };
    /**
     * Add node to chart
     * @param workerNodes - node to add
     */
    const handleRemoveNodes = (workerNodes: WorkerNode[]) => {
        if (!nodesLayerRef.current) {
            return;
        }

        for (const node of workerNodes) {
            const konvaNode = nodesLayerRef.current.findOne(`#${node.id}`);
            if (konvaNode) {
                konvaNode.destroy();
                // konvaNode.remove();
            }
        }
    };
    /**
     * modify node to chart
     * @param workerNodes
     */
    const handleModifyNodes = (workerNodes: WorkerNode[]) => {
        if (!nodesLayerRef.current) {
            return;
        }

        for (const node of workerNodes) {
            const konvaNode = nodesLayerRef.current.findOne(`#${node.id}`);
            if (konvaNode) {
                konvaNode.to({
                    radius: node.radius,
                    duration: 0.1,
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    easing: Konva.Easings.EaseInOut
                });
                // konvaNode.remove();
                // handleAddNode(node);
            }
        }
    };

    /**
     * Handle message from worker
     * @param event
     */
    const onWorkerMessage = (event: MessageEvent<Updates & ZoomY>) => {
        const { add, modify, remove, maxY, minY } = event.data;

        handleAddNodes(add);
        handleRemoveNodes(remove);
        handleModifyNodes(modify);
        recalculateZoom(maxY);

        nodesLayerRef.current.batchDraw();
    };

    /**
     * Start work with worker
     */
    useEffect(() => {
        workerRef.current = new Worker(new URL("worker.ts", import.meta.url));
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

export default VisualizerCanvas;
