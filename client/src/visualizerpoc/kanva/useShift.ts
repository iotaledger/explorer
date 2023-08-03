import Konva from "konva";
import { RefObject, useState, useRef, useEffect } from "react";
import { THRESHOLD_SHIFT_PX } from "../common/constants";

export const useShift = ({
    graphShiftCountRef,
    nodesLayerRef,
    resetY
}: {
    stageRef?: RefObject<Konva.Stage>;
    nodesLayerRef?: RefObject<Konva.Layer>;
    linesLayerRef?: RefObject<Konva.Layer>;
    lastNodePositionRef?: RefObject<number>;
    graphShiftCountRef?: RefObject<number>;
    resetY: () => void;
}) => {
    // Define generateX function
    const generateX = () =>
        graphShiftCountRef &&
        (graphShiftCountRef.current ?? 0) * THRESHOLD_SHIFT_PX +
            Math.floor(Math.random() * THRESHOLD_SHIFT_PX) +
            1;

    const shiftGraphRight = () => {
        if (
            nodesLayerRef?.current &&
            graphShiftCountRef &&
            graphShiftCountRef?.current !== null
        ) {
            const newPosition = -(
                graphShiftCountRef.current * THRESHOLD_SHIFT_PX
            );

            // nodes animation
            const tweenNode = new Konva.Tween({
                node: nodesLayerRef.current,
                duration: 0.2, // The duration of the animation in seconds
                x: newPosition
            });

            // @ts-expect-error const not let
            graphShiftCountRef.current++;
            resetY();
            tweenNode.play();
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            shiftGraphRight();
        }, 150); // call shiftGraphRight every second

        return () => clearInterval(intervalId); // This is cleanup function that React will call when the component is unmounted
    }, [shiftGraphRight]); // list shiftGraphRight as a dependency, so if it changes, the effect is re-run

    return { generateX };
};
