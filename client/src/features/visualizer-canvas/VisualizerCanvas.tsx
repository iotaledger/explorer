// @ts-nocheck
// import { default as useResizeObserver } from "@react-hook/resize-observer";
import Konva from "konva";
import React, { useEffect, useRef } from "react";

import { Layer, Stage, FastLayer } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { WorkerNode } from "./entities/Nodes";
import useDimensions from "./hooks/useDimensions";
import { useInit } from "./hooks/useInit";
import { useUpdateListener } from "./hooks/useUpdateListener";
import { useZoom } from "./hooks/useZoom";
import {
    ANIMATION_DURATION_MODIFY_NODE,
    ANIMATION_DURATION_SHOW_NODE,
    KONVA_SHIFT_DURATION,
    NODE_SIZE_DEFAULT,
    SCALE_DEFAULT,
    THRESHOLD_SHIFT_PX
} from "./lib/constants";
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
    const workerRef = useRef(null);
    window.st = stageRef;
    window.nd = nodesLayerRef;

    /**
     * Custom hooks
     */
    const { divWrapRef, isInit, stageHeight, stageWidth } = useInit(stageRef);
    const [networkConfig] = useNetworkConfig(network);
    // const { recalculateZoom } = useZoom({ stageRef });

    /**
     * Methods: onNewBlock
     * @param block
     */
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

    /**
     * Methods:
     * @param node
     */
    const handleAddNode = (node: WorkerNode) => {
        const konvaNode = new Konva.Circle({
            perfectDrawEnabled: false,
            x: node.x,
            y: node.y,
            radius: node.radius ?? NODE_SIZE_DEFAULT,
            fill: node.color,
            id: node.id,
            opacity: 0
        });

        konvaNode.on("click", (e) => {
            console.log("click", e);
        });
        konvaNode.on("mouseenter", (e) => {
            e.currentTarget.to({
                opacity: 0.5
            });
        });
        konvaNode.on("mouseleave", (e) => {
            setTimeout(() => {
                e.currentTarget.to({
                    opacity: 1
                });
            }, 500);
        });

        nodesLayerRef.current.add(konvaNode);

        // Create a tween to animate the opacity
        const tween = new Konva.Tween({
            node: konvaNode,
            duration: ANIMATION_DURATION_SHOW_NODE, // duration in seconds
            opacity: 1 // target opacity
        });

        // Play the tween to start the animation
        tween.play();
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
                    fill: node.color,
                    duration: ANIMATION_DURATION_MODIFY_NODE,
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    easing: Konva.Easings.EaseInOut
                });
                // konvaNode.remove();
                // handleAddNode(node);
            }
        }
    };

    /**
     * Methods: handlePayloadUpdateNodes
     * @param payload
     */
    const handlePayloadUpdateNodes = (
        payload: WorkerUpdateNodes["payload"]
    ) => {
        const { add, remove, modify } = payload;
        handleAddNodes(add);
        handleRemoveNodes(remove);
        handleModifyNodes(modify);
        // recalculateZoom(maxY); // TODO move it to separate event
    };

    /**
     * Methods: handlePayloadUpdateShift
     * @param payload
     */
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

    const handlePayloadUpdateZoom = (payload: WorkerUpdateZoom["payload"]) => {
        if (stageRef.current) {
            stageRef?.current?.scale({
                x: payload.zoom,
                y: payload.zoom
            }); // Set the scale as needed
        }
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
        const start = Date.now();
        const { type, payload } = event.data;

        if (type === WorkerType.Full) {
            handlePayloadUpdateNodes(payload);
            handlePayloadUpdateShift(payload);
            handlePayloadUpdateZoom(payload);
        }

        if (type === WorkerType.UpdateNodes) {
            handlePayloadUpdateNodes(payload);
        }

        if (type === WorkerType.UpdateShift) {
        }

        nodesLayerRef.current.batchDraw();

        console.log("--- end", Date.now() - start, "ms");
    };

    /**
     * Start work with worker
     */
    useEffect(() => {
        workerRef.current = new Worker(new URL("worker.ts", import.meta.url));
        workerRef.current.postMessage(null);

        workerRef.current.addEventListener("message", onWorkerMessage);
    }, []);

    /**
     * Listen width of stage.
     */
    useEffect(() => {
        if (!stageWidth || !stageHeight) {
            return;
        }

        workerRef.current.postMessage({
            type: "setStageHeight",
            data: stageHeight
        });
        workerRef.current.postMessage({
            type: "setStageWidth",
            data: stageWidth
        });
    }, [stageWidth, stageHeight]);

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
                    <FastLayer ref={nodesLayerRef} />
                </Stage>
            </div>
        </Wrapper>
    );
};

export default VisualizerCanvas;
