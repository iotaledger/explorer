import Konva from "konva";
import { RefObject, useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { SCALE_DEFAULT } from "../lib/constants";

export const useInit = (
    stageRef: RefObject<Konva.Stage>,
    nodesLayerRef: RefObject<Konva.Layer>
) => {
    const [isInit, setIsInit] = useState(false);
    const { width, height, ref: divWrapRef } = useResizeDetector();

    const getInitialPositionY = () => {
        if (!stageRef.current) {
            return 0;
        }
        // Set the initial position of the stage
        const viewportHeight = stageRef.current.height(); // The height of the viewport
        return viewportHeight / 2;
    };

    const getInitialPositionX = () => {
        if (!stageRef.current) {
            return 0;
        }
        // Set the initial position of the stage
        const viewportWidth = stageRef.current.width(); // The width of the viewport
        return viewportWidth * 0.5;
    };

    // check if the stage is ready
    useEffect(() => {
        if (stageRef.current && width && height) {
            stageRef.current.width(width);
            stageRef.current.height(height);
            setIsInit(true);
        }
    }, [width, height, stageRef]);

    /**
     * Set initial position
     */
    useEffect(() => {
        if (!isInit) {
            return;
        }
        if (stageRef.current) {
            // Set the initial scale of the stage
            // const initialY = getYCenterCoordinate();
            // const initialX = getXCenterCoordinate();
            stageRef.current.position({
                x: getInitialPositionX(),
                y: getInitialPositionY()
            });

            setTimeout(() => {
                return;
                stageRef?.current?.scale({
                    x: SCALE_DEFAULT,
                    y: SCALE_DEFAULT
                }); // Set the scale as needed
            }, 3000);
        }
    }, [isInit]);

    // useEffect(() => {
    //     if (!nodesLayerRef?.current || !stageRef?.current) {
    //         return;
    //     }
    //     const stage = stageRef.current;
    //     let nodesLayer = nodesLayerRef.current;
    //
    //     // Create a layer for the lines
    //     // linesLayerRef.current = new Konva.Layer();
    //     // stage.add(linesLayerRef.current);
    //
    //     // Create a layer for the nodes
    //
    //     nodesLayer = new Konva.Layer();
    //     stage.add(nodesLayerRef.current);
    // }, []);

    return { isInit, divWrapRef, stageWidth: width, stageHeight: height };
};
