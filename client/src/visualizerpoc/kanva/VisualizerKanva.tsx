// @ts-nocheck
import Konva from "konva";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { useUpdateListener } from "../common/useUpdateListener";
import { placeNodeCallback, THRESHOLD_PX } from "../vivagraph-layout/layout";
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
    // Store a map of node IDs to Konva nodes
    const nodeMap = useRef<Map<string, Konva.Circle>>(new Map());
    const linesMap = useRef<string[]>([]);
    const parentNodesList = useRef<string[]>([]);

    const { handleWheel } = useZoom();
    const {
        handleMouseMove,
        handleMouseUp,
        handleMouseDown,
        shiftGraphRight
    } = useDrag(stageRef, layerRef, lastNodePositionRef);
    const { removeFirstNodeFromLayer, storeAddBlock, getNumberOfNodes } = useStoreIds();

    const onNewBlock = (block: IFeedBlockData) => {
        if (layerRef.current) {
            const { x, y } = placeNodeCallback(lastNodePositionRef.current);

            lastNodePositionRef.current += 1;
            storeAddBlock(block.blockId);

            if (getNumberOfNodes() > LIMIT_NODES) {
                removeFirstNodeFromLayer(layerRef.current, linesMap);
            }


            const colors = ["#7575ed", "#4f4fed", "#4141f1", "#1010eb"];
            const random = Math.floor(Math.random() * colors.length);
            // add newNode
            const newNode = new Konva.Circle({
                x,
                y,
                radius: 80,
                fill: colors[random],
                id: block.blockId
            });

            // Store the Konva node in the nodeMap
            parentNodesList.current.push(block.blockId);
            nodeMap.current.set(block.blockId, {
                x,
                y
            });

            if (parentNodesList.current.length > 200) {
                const firstParent = parentNodesList.current.shift();
                nodeMap.current.delete(firstParent);
                // console.log(nodeMap.current.size);
            }

            for (const parent of block.parents) {
                const parentKonvaNode = nodeMap.current.get(parent);
                if (parentKonvaNode) {
                    const id = `${parentKonvaNode.blockId}-${block.blockId}`;

                    const line = new Konva.Line({
                        points: [parentKonvaNode.x, parentKonvaNode.y, x, y],
                        stroke: "rgba(180,180,180,0.1)",
                        strokeWidth: 5,
                        lineCap: "round",
                        lineJoin: "round",
                        id
                    });
                    linesMap.current.push(id);
                    layerRef.current.add(line);
                }
            }

            newNode.on("click", () => {
                console.log("click");
            });
            const returnedFromLayer = layerRef.current.add(newNode);
            console.log("--- returnedFromLayer", returnedFromLayer);

            // Shift graph every new node
            shiftGraphRight();

            // now we need to refresh the layer manually
            layerRef.current.batchDraw();
        }
    };

    const { nodes } = useUpdateListener(network, onNewBlock);


    return (
        <Stage
            width={window.innerWidth - 50}
            height={window.innerHeight}
            // onWheel={handleWheel}
            // draggable
            // onMouseDown={handleMouseDown}
            // onMouseUp={handleMouseUp}
            // onMouseMove={handleMouseMove}
            ref={stageRef}
        >
            <Layer ref={layerRef} />
        </Stage>
    );
};

export default VisualizerKanva;
