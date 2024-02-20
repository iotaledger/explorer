import { CameraControls as DreiCameraControls } from "@react-three/drei";
import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasElement } from "./enums";
import { useTangleStore, useConfigStore } from "./store";
import { VISUALIZER_PADDINGS } from "./constants";

const CameraControls = () => {
    const [shouldLockZoom, setShouldLockZoom] = React.useState<boolean>(false);
    const controls = React.useRef<DreiCameraControls>(null);

    const CAMERA_ANGLES = getCameraAngles();

    const zoom = useTangleStore((s) => s.zoom);
    const get = useThree((state) => state.get);
    const mesh = get().scene.getObjectByName(CanvasElement.TangleWrapperMesh);
    const canvasDimensions = useConfigStore((state) => state.dimensions);
    const camera = useThree((state) => state.camera);

    // Set fixed zoom
    useEffect(() => {
        if (controls.current && shouldLockZoom) {
            controls.current.maxZoom = zoom;
            controls.current.minZoom = zoom;
        }
    }, [controls, zoom, shouldLockZoom]);

    /**
     * Sets the scene to be vertical or horizontal
     * depending on the canvas dimensions.
     */
    useEffect(() => {
        if (camera && canvasDimensions.width && canvasDimensions.height) {
            const renderVerticalScene = canvasDimensions.width < canvasDimensions.height;
            const cameraUp: [number, number, number] = renderVerticalScene ? [-1, 0, 0] : [0, 1, 0];
            camera.up.set(...cameraUp);
        }
    }, [canvasDimensions, camera]);

    // Fix to TangleMesh
    useEffect(() => {
        if (controls.current && mesh) {
            controls.current.fitToBox(mesh, false, { ...VISUALIZER_PADDINGS });
            setShouldLockZoom(true);
        }
    }, [controls, mesh]);

    return <DreiCameraControls ref={controls} makeDefault {...CAMERA_ANGLES} />;
};

export default CameraControls;
