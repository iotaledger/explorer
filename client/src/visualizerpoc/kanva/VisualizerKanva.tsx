// @ts-nocheck
import Konva from "konva";
import React, { useEffect, useRef } from "react";
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

export const VisualizerKanva: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({ match: { params: { network } } }) => {
    const layerRef = useRef<Konva.Layer>(null);
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
                    x: pointerPosition.x - mousePointTo.x * newScale,
                    y: pointerPosition.y - mousePointTo.y * newScale
                });

                stage.batchDraw();
            }
        }
    };

    const onNewBlock = (block: any) => {
        if (layerRef.current) {
            const { x, y } = placeNodeCallback(numberOfNodesRef.current);
            numberOfNodesRef.current += 1;

            // add node
            const circle = new Konva.Circle({
                x,
                y,
                radius: 10,
                fill: "blue"
            });
            layerRef.current.add(circle);

            // now we need to to refresh the layer manually
            layerRef.current.batchDraw();
        }
    };

    const { nodes } = useUpdateListener(network, onNewBlock);


    return (
        <Stage width={window.innerWidth} height={window.innerHeight} onWheel={handleWheel}>
            <Layer ref={layerRef} />
        </Stage>
    );
};

export default VisualizerKanva;
