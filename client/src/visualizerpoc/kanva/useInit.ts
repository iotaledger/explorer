import Konva from "konva";
import { RefObject, useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

export const useInit = (
    stageRef: RefObject<Konva.Stage>,
    nodesLayerRef: RefObject<Konva.Layer>
) => {
    const [isInit, setIsInit] = useState(false);
    const { width, height, ref: divWrapRef } = useResizeDetector();

    const getYCenterCoordinate = () => {
        if (!stageRef.current) {
            return 0;
        }
        // Set the initial position of the stage
        const viewportHeight = stageRef.current.height(); // The height of the viewport
        const nodeRangeCenter = -800; // The center of the Y range of the nodes (0 + 800) / 2
        return (viewportHeight - nodeRangeCenter) / 2 + nodeRangeCenter / 2;
    };

    const getXCenterCoordinate = () => {
        if (!stageRef.current) {
            return 0;
        }
        // Set the initial position of the stage
        const viewportWidth = stageRef.current.width(); // The width of the viewport
        const nodeRangeCenter = -400; // The center of the Y range of the nodes (0 + 800) / 2
        return viewportWidth - 50;
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
            stageRef.current.scale({ x: 0.25, y: 0.25 }); // Set the scale as needed

            const initialY = getYCenterCoordinate();
            const initialX = getXCenterCoordinate();

            stageRef.current.position({ x: initialX, y: initialY });
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