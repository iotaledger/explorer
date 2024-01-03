import { CameraControls as DreiCameraControls } from "@react-three/drei";
import { getCameraAngles } from "./utils";
import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasElement } from "./enums";
import { useTangleStore } from "./store";
import { VISUALIZER_PADDINGS } from "./constants";

const CameraControls = () => {
    const [shouldLockZoom, setShouldLockZoom] = React.useState<boolean>(false);
    const controls = React.useRef<DreiCameraControls>(null);

    const CAMERA_ANGLES = getCameraAngles();

    const zoom = useTangleStore((s) => s.zoom);
    const get = useThree((state) => state.get);
    const mesh = get().scene.getObjectByName(CanvasElement.TangleWrapperMesh);

    // Set fixed zoom
    useEffect(() => {
        if (controls.current && shouldLockZoom) {
            controls.current.maxZoom = zoom;
            controls.current.minZoom = zoom;
        }
    }, [controls, zoom, shouldLockZoom]);

    // Fix to TangleMesh
    useEffect(() => {
        if (controls.current && mesh) {
            controls.current.fitToBox(mesh, false, { ...VISUALIZER_PADDINGS });
            controls.current.setOrbitPoint(0, 0, 0);
            setShouldLockZoom(true);
        }
    }, [controls, mesh]);

    return <DreiCameraControls ref={controls} makeDefault {...CAMERA_ANGLES} />;
};

export default CameraControls;
