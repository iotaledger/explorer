// @ts-nocheck
import Konva from "konva";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { useUpdateListener } from "../common/useUpdateListener";
import { placeNodeCallback } from "../vivagraph-layout/layout";
import { LIMIT_NODES } from "./constants";
import { useDrag } from "./useDrag";
import { useStoreIds } from "./useStoreIds";
import { useZoom } from "./useZoom";

interface ParentNode {
    id: number;
    x: number;
    y: number;
}

interface Node {
    id: number;
    x: number;
    y: number;
    parents: ParentNode[];
}

interface GraphProps {
    nodes: Node[];
}

export const VisualizerKanva: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: { params: { network } }
}) => {
    const layerRef = useRef<Konva.Layer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const lastNodePositionRef = useRef<number>(0);
    const { handleWheel } = useZoom();
    const { handleMouseMove, handleMouseUp, handleMouseDown } = useDrag();
    const { removeFirstNodeFromLayer, storeAddBlock, getNumberOfNodes } = useStoreIds();


    const onNewBlock = (block: IFeedBlockData) => {
        if (layerRef.current) {
            const { x, y } = placeNodeCallback(lastNodePositionRef.current);

            lastNodePositionRef.current += 1;
            storeAddBlock(block.blockId);

            if (getNumberOfNodes() > LIMIT_NODES) {
                removeFirstNodeFromLayer(layerRef.current);
            }

            // add node
            const circle = new Konva.Circle({
                x,
                y,
                radius: 30,
                fill: "blue",
                id: block.blockId
            });

            circle.on("click", () => {
                console.log("click");
            });
            layerRef.current.add(circle);

            // now we need to to refresh the layer manually
            layerRef.current.batchDraw();
        }
    };

    const { nodes } = useUpdateListener(network, onNewBlock);

    useEffect(() => {
        if (stageRef.current) {
            // Set the initial scale of the stage
            stageRef.current.scale({ x: 0.1, y: 0.1 }); // Set the scale as needed

            // Set the initial position of the stage
            // const canvasHeight =
            // window.sc = stageRef.current;
            const viewportHeight = stageRef.current.height(); // The height of the viewport
            const nodeRangeCenter = 400; // The center of the Y range of the nodes (0 + 800) / 2
            const initialY = ((viewportHeight - nodeRangeCenter) / 2) + (nodeRangeCenter / 2);
            console.log("--- initialY", viewportHeight, initialY);

            stageRef.current.position({ x: 0, y: initialY });
        }
    }, []);


    return (
        <Stage
            width={window.innerWidth - 50} height={window.innerHeight}
            onWheel={handleWheel}
            draggable
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            ref={stageRef}
        >
            <Layer ref={layerRef} />
        </Stage>
    );
};

export default VisualizerKanva;
