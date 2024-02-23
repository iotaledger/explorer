import { CameraControls as DreiCameraControls } from "@react-three/drei";
import { getCameraAngles } from "./utils";
import React, { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasElement } from "./enums";
import { useTangleStore, useConfigStore } from "./store";
import { VISUALIZER_PADDINGS } from "./constants";

const CAMERA_ANGLES = getCameraAngles();

const CameraControls = () => {
    const controls = React.useRef<DreiCameraControls>(null);
    const [shouldLockZoom, setShouldLockZoom] = useState<boolean>(false);

    const scene = useThree((state) => state.scene);
    const zoom = useTangleStore((state) => state.zoom);
    const mesh = scene.getObjectByName(CanvasElement.TangleWrapperMesh) as THREE.Mesh | undefined;
    const canvasDimensions = useConfigStore((state) => state.dimensions);

    /**
     * Fits the camera to the TangleMesh.
     */
    function fitCameraToTangle(controls: DreiCameraControls | null, mesh?: THREE.Mesh) {
        if (controls && mesh) {
            const previousZoom = controls.camera.zoom;
            controls.minZoom = 0.01;
            controls.maxZoom = Infinity;
            controls.fitToBox(mesh, false, { ...VISUALIZER_PADDINGS });
            controls.minZoom = previousZoom;
            controls.maxZoom = previousZoom;
        }
    }

    /**
     * Sets the scene to be vertical or horizontal
     * depending on the canvas dimensions.
     */
    useEffect(() => {
        const cameraControls = controls.current;
        if (cameraControls && canvasDimensions.width && canvasDimensions.height) {
            const camera = controls.current?.camera;
            const renderVerticalScene = canvasDimensions.width < canvasDimensions.height;
            const cameraUp: [number, number, number] = renderVerticalScene ? [1, 0, 0] : [0, 1, 0];
            setShouldLockZoom(false);
            camera.up.set(...cameraUp);
            setShouldLockZoom(true);
        }
    }, [canvasDimensions, controls, mesh]);

    /**
     * Fit camera to TangleMesh on mount and on window resize.
     */
    useEffect(() => {
        const adjustCamera = () => fitCameraToTangle(controls.current, mesh);
        adjustCamera();

        window.addEventListener("resize", adjustCamera);
        return () => {
            window.removeEventListener("resize", adjustCamera);
        };
    }, [controls, mesh]);

    /**
     * Locks the camera zoom to the current zoom value.
     */
    useEffect(() => {
        if (controls.current) {
            controls.current.maxZoom = shouldLockZoom ? zoom : Infinity;
            controls.current.minZoom = shouldLockZoom ? zoom : 0.01;
        }
    }, [controls.current, shouldLockZoom, zoom]);

    return <DreiCameraControls ref={controls} makeDefault {...CAMERA_ANGLES} />;
};

export default CameraControls;
