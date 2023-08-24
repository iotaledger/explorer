// @ts-nocheck
// import { default as useResizeObserver } from "@react-hook/resize-observer";
import Konva from "konva";
import React, { useEffect, useRef } from "react";

import { Layer, Stage } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { useInit } from "./hooks/useInit";
import { useUpdateListener } from "./hooks/useUpdateListener";
import { useZoom } from "./hooks/useZoom";
import {
    KONVA_SHIFT_DURATION,
    NODE_SIZE_DEFAULT,
    THRESHOLD_SHIFT_PX
} from "./lib/constants";
import { WorkerNode } from "./lib/Nodes";
import "./worker";
import {
    WorkerType,
    WorkerUpdateFull,
    WorkerUpdateNodes,
    WorkerUpdateShift
} from "./lib/types";

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
            radius: node.radius ?? NODE_SIZE_DEFAULT,
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
     * @param workerNodes - .
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

    const handlePayloadUpdateNodes = (
        payload: WorkerUpdateNodes["payload"]
    ) => {
        const { add, remove, modify } = payload;
        handleAddNodes(add);
        handleRemoveNodes(remove);
        handleModifyNodes(modify);
        // recalculateZoom(maxY); // TODO move it to separate event
    };

    const handlePayloadUpdateShift = (
        payload: WorkerUpdateShift["payload"]
    ) => {
        const { shift } = payload;
        const newPosition = -(shift * THRESHOLD_SHIFT_PX);

        // nodes animation
        const tweenNode = new Konva.Tween({
            node: nodesLayerRef.current,
            duration: KONVA_SHIFT_DURATION, // The duration of the animation in seconds
            x: newPosition
        });
        tweenNode.play();
    };

    /**
     * Handle message from worker
     * @param event
     */
    const onWorkerMessage = (
        event: MessageEvent<
            WorkerUpdateNodes | WorkerUpdateShift | WorkerUpdateFull
        >
    ) => {
        const { type, payload } = event.data;

        if (type === WorkerType.Full) {
            handlePayloadUpdateNodes(payload);
            handlePayloadUpdateShift(payload);
        }

        if (type === WorkerType.UpdateNodes) {
            handlePayloadUpdateNodes(payload);
        }

        if (type === WorkerType.UpdateShift) {
        }

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
