import { CameraControls as DreiCameraControls } from "@react-three/drei";
import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasElement } from "./enums";
import { useConfigStore } from "./store";
import { VISUALIZER_PADDINGS } from "./constants";
import { getCameraAngles } from "./utils";

const CAMERA_ANGLES = getCameraAngles();

const CameraControls = () => {
    const controls = React.useRef<DreiCameraControls>(null);

    const scene = useThree((state) => state.scene);
    const mesh = scene.getObjectByName(CanvasElement.TangleWrapperMesh) as THREE.Mesh | undefined;
    const canvasDimensions = useConfigStore((state) => state.dimensions);

    /**
     * Locks the camera zoom to the current zoom value.
     */
    function lockCameraZoom(controls: DreiCameraControls) {
        const zoom = controls.camera.zoom;
        controls.maxZoom = zoom;
        controls.minZoom = zoom;
    }

    /**
     * Unlocks the camera zoom for free movement.
     */
    function unlockCameraZoom(controls: DreiCameraControls) {
        controls.maxZoom = Infinity;
        controls.minZoom = 0.01;
    }

    /**
     * Fits the camera to the TangleMesh.
     */
    function fitCameraToTangle(controls: DreiCameraControls | null, mesh?: THREE.Mesh) {
        if (controls && mesh) {
            unlockCameraZoom(controls);
            controls.fitToBox(mesh, false, { ...VISUALIZER_PADDINGS });
            lockCameraZoom(controls);
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
            const cameraUp: [number, number, number] = renderVerticalScene ? [-1, 0, 0] : [0, 1, 0];
            camera.up.set(...cameraUp);
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

    return <DreiCameraControls ref={controls} makeDefault {...CAMERA_ANGLES} />;
};

export default CameraControls;
