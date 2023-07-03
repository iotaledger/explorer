import Konva from "konva";
import { useState } from "react";

export const useDrag = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();
        if (stage) {
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
