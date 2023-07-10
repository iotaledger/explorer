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

    const shiftGraphRight = () => {
        if (nodesLayerRef.current && lastNodePositionRef.current) {
            // console.log("--- calls", lastNodePositionRef.current);
            const newPosition = -(lastNodePositionRef.current * THRESHOLD_PX);
            const currentPosition = nodesLayerRef.current.x();
            const shiftBy = -30; // change this to the number of pixels you want to shift
            // const newPosition = currentPosition + shiftBy;

            // console.log("--- newPosition", newPosition);
            // nodesLayerRef.current.x(newPosition);

            // nodesLayerRef.current.batchDraw(); // Manually redraw the layer

            // nodes animation
            const tweenNode = new Konva.Tween({
                node: nodesLayerRef.current,
                duration: 0.05, // The duration of the animation in seconds
                x: newPosition
                // x: nodesLayerRef.current.x() + shiftBy
            });
            tweenNode.play();

            // lines
            // const tweenLines = new Konva.Tween({
            //     node: linesLayerRef.current,
            //     duration: 0.16, // The duration of the animation in seconds
            //     x: newPosition
            // });
            // tweenLines.play();
        }
    };

    return {
        handleMouseDown,
        handleMouseUp,
        handleMouseMove,
        shiftGraphRight
    };
};
