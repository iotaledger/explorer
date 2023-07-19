import Konva from "konva";
import { useEffect, useState, RefObject } from "react";
import { THRESHOLD_PX } from "../vivagraph-layout/layout";

export const useDrag = (
    stageRef: RefObject<Konva.Stage>,
    nodesLayerRef: RefObject<Konva.Layer>,
    linesLayerRef: RefObject<Konva.Layer>,
    lastNodePositionRef: RefObject<number>
) => {
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();
        if (stage?.getPointerPosition()) {
            // @ts-expect-error
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

    return {
        handleMouseDown,
        handleMouseUp,
        handleMouseMove
    };
};
