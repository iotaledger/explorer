// @ts-nocheck
import Konva from "konva";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useUpdateListener } from "../common/useUpdateListener";
import { placeNodeCallback } from "../vivagraph-layout/layout";

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
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const numberOfNodesRef = useRef<number>(0);

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const scaleBy = 1.1;
        const stage = e.target.getStage();

        if (stage) {
            const oldScale = stage.scaleX();

            const pointerPosition = stage.getPointerPosition();

            if (pointerPosition) {
                const mousePointTo = {
                    x: (pointerPosition.x - stage.x()) / oldScale,
                    y: (pointerPosition.y - stage.y()) / oldScale
                };

                const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

                stage.scale({ x: newScale, y: newScale });

                stage.position({
                    x: pointerPosition.x - (mousePointTo.x * newScale),
                    y: pointerPosition.y - (mousePointTo.y * newScale)
                });

                stage.batchDraw();
            }
        }
    };

    const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();
        if (stage) {
            setPos(stage.getPointerPosition());
        }
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();

        if (!isDragging || !stage) {
            return;
        }

        const newPos = stage.getPointerPosition();

        if (newPos && pos) {
            stage.position({
                x: stage.x() + newPos.x - pos.x,
                y: stage.y() + newPos.y - pos.y
            });

            setPos(newPos);
            stage.batchDraw();
        }
    };

    const onNewBlock = (block: any) => {
        if (layerRef.current) {
            const { x, y } = placeNodeCallback(numberOfNodesRef.current);
            numberOfNodesRef.current += 1;

            if (numberOfNodesRef.current > 2500) {
                return;
            }

            // add node
            const circle = new Konva.Circle({
                x,
                y,
                radius: 10,
                fill: "blue",
                id: block.blockId
            });

            circle.on("click", () => onNodeClick(nodes[i].id));
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
            const initialY = (viewportHeight - nodeRangeCenter) / 2 + (nodeRangeCenter / 2);
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
