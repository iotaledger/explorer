import { CameraControls as DreiCameraControls } from "@react-three/drei";
import { getCameraAngles } from "./utils";
import React, { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasElement } from "./enums";
import { VISUALIZER_PADDINGS } from "./constants";
import { useTangleStore } from "./store";

const CAMERA_ANGLES = getCameraAngles();

const CameraControls = () => {
    const controls = React.useRef<DreiCameraControls>(null);
    const [shouldLockZoom, setShouldLockZoom] = useState<boolean>(false);

    const scene = useThree((state) => state.scene);
    const zoom = useTangleStore((state) => state.zoom);
    const mesh = scene.getObjectByName(CanvasElement.TangleWrapperMesh) as THREE.Mesh | undefined;

    /**
     * Fits the camera to the TangleMesh.
     */
    function fitCameraToTangle(controls: DreiCameraControls | null, mesh?: THREE.Mesh) {
        if (controls && mesh) {
            setShouldLockZoom(false);
            controls.fitToBox(mesh, false, { ...VISUALIZER_PADDINGS });
            setShouldLockZoom(true);
        }
    }

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
