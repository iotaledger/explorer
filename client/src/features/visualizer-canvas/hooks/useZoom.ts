import Konva from "konva";
import { RefObject, useState, useRef } from "react";

const SCALE_MIN = 0.8;
const SCALE_MAX = 0.05;
const MAX_Y = 800;
const MIN_Y = -800;

export const useZoom = ({
    stageRef
}: {
    stageRef?: RefObject<Konva.Stage>;
}) => {
    const minY = useRef(MIN_Y);
    const maxY = useRef(MAX_Y);

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

                const newScale =
                    e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

                if (newScale < SCALE_MAX || newScale > SCALE_MIN) {
                    return;
                }

                stage.scale({ x: newScale, y: newScale });

                stage.position({
                    x: pointerPosition.x - mousePointTo.x * newScale,
                    y: pointerPosition.y - mousePointTo.y * newScale
                });

                // stage.batchDraw();
            }
        }
    };

    /**
     * Change zoom depends on coordinate of nodes
     * @param newY - new Y coordinate
     * @returns void
     */
    const recalculateZoom = (newY: number) => {
        const isPositive = newY > 0;
        const DEFAULT_SCALE = 0.25;

        if (!stageRef?.current) {
            return;
        }

        if (newY < MAX_Y) {
            stageRef.current.scale({ x: DEFAULT_SCALE, y: DEFAULT_SCALE });
            stageRef.current.batchDraw();
            return;
        }

        // 0.25 = 100%
        // x == height / stageHeight

        const getNewScale = (height: number) => {
            const stageHeight = stageRef?.current?.height() as number;
            return ((DEFAULT_SCALE * stageHeight) / height) * 1.5;
        };

        if (isPositive && newY > maxY.current) {
            const newScale = getNewScale(newY - minY.current);

            stageRef.current.scale({ x: newScale, y: newScale });
            maxY.current = newY;
            stageRef.current.batchDraw();
        }

        if (!isPositive && newY < minY.current) {
            const height = Math.abs(newY) + Math.abs(minY.current);
            const newScale = getNewScale(height);
            console.log("--- newScale", newScale);
            stageRef.current.scale({ x: newScale, y: newScale });
            minY.current = newY;
            stageRef.current.batchDraw();
        }
    };
    return {
        recalculateZoom
    };
};
