import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useBlockStore } from "../store";

export const useZoomDynamic = () => {
    /**
     * Zoom Changes
     */
    const cameraState = useThree(state => state.camera);
    const zoomStore = useBlockStore(s => s.zoom);
    const setZoom = useBlockStore(s => s.setZoom);
    useEffect(() => {
        if (cameraState) {
            // @ts-expect-error
            window.setZoom = setZoom;
            cameraState.zoom = zoomStore;
            cameraState.updateProjectionMatrix();
        }
    }, [cameraState, zoomStore]);

    return {};
};
