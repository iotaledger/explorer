import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useTangleStore } from "../store";

export const useZoomDynamic = () => {
    /**
     * Zoom Changes
     */
    const cameraState = useThree(state => state.camera);
    const zoomStore = useTangleStore(s => s.zoom);
    useEffect(() => {
        if (cameraState) {
            cameraState.zoom = zoomStore;
            cameraState.updateProjectionMatrix();
        }
    }, [cameraState, zoomStore]);

    return {};
};
