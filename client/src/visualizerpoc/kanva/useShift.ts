import Konva from "konva";
import { RefObject, useState, useRef, useEffect } from "react";
import { THRESHOLD_PX } from "../vivagraph-layout/layout";

export const useShift = (
    stageRef: RefObject<Konva.Stage>,
    nodesLayerRef: RefObject<Konva.Layer>,
    linesLayerRef: RefObject<Konva.Layer>,
    lastNodePositionRef: RefObject<number>,
    graphShiftCountRef: RefObject<number>
) => {
    const shiftGraphRight = () => {
        if (nodesLayerRef.current && graphShiftCountRef.current !== null) {
            const newPosition = -(graphShiftCountRef.current * THRESHOLD_PX);
            const currentPosition = nodesLayerRef.current.x();
            const shiftBy = -30; // change this to the number of pixels you want to shift
            // const newPosition = currentPosition + shiftBy;

            // nodes animation
            const tweenNode = new Konva.Tween({
                node: nodesLayerRef.current,
                duration: 0.05, // The duration of the animation in seconds
                x: newPosition
            });

            // @ts-expect-error const not let
            graphShiftCountRef.current++;
            tweenNode.play();
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            shiftGraphRight();
        }, 100); // call shiftGraphRight every second

        return () => clearInterval(intervalId); // This is cleanup function that React will call when the component is unmounted
    }, [shiftGraphRight]); // list shiftGraphRight as a dependency, so if it changes, the effect is re-run

    return {};
};
