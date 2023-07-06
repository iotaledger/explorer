import Konva from "konva";
import { useEffect, useState, RefObject } from "react";
import { THRESHOLD_PX } from "../vivagraph-layout/layout";

export const useDrag = (stageRef: RefObject<Konva.Stage>, layerRef: RefObject<Konva.Layer>, lastNodePositionRef: RefObject<number>) => {
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

    const getYCenterCoordinate = () => {
        if (!stageRef.current) {
            return 0;
        }
        // Set the initial position of the stage
        const viewportHeight = stageRef.current.height(); // The height of the viewport
        const nodeRangeCenter = -400; // The center of the Y range of the nodes (0 + 800) / 2
        return ((viewportHeight - nodeRangeCenter) / 2) + (nodeRangeCenter / 2);
    };

    const getXCenterCoordinate = () => {
        if (!stageRef.current) {
            return 0;
        }
        // Set the initial position of the stage
        const viewportWidth = stageRef.current.width(); // The width of the viewport
        const nodeRangeCenter = -400; // The center of the Y range of the nodes (0 + 800) / 2
        return ((viewportWidth - nodeRangeCenter) / 2) + (nodeRangeCenter / 2);
    };

    const shiftGraphRight = () => {
        if (layerRef.current && lastNodePositionRef.current) {
            const newPosition = -(lastNodePositionRef.current * THRESHOLD_PX);
            layerRef.current.x(newPosition);


            // Create and start the animation
            // const tween = new Konva.Tween({
            //     node: layerRef.current,
            //     duration: 16, // The duration of the animation in seconds
            //     x: newPosition
            // });
            // tween.play();
            layerRef.current.batchDraw();
        }
    };

    useEffect(() => {
        if (stageRef.current) {
            // Set the initial scale of the stage
            stageRef.current.scale({ x: 0.1, y: 0.1 }); // Set the scale as needed

            const initialY = getYCenterCoordinate();
            const initialX = getXCenterCoordinate();

            stageRef.current.position({ x: initialX, y: initialY });
        }
    }, []);


    return {
        handleMouseDown,
        handleMouseUp,
        handleMouseMove,
        shiftGraphRight
    };
};
