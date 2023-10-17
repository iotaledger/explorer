import { useMemo } from "react";
import { useBlockStore } from "../store";

export const useBorderPositions = () => {
    const zoom = useBlockStore(s => s.zoom);
    const canvasWidth = useBlockStore(state => state.dimensions.width);

    const borderLeftPosition = useMemo(() => -(canvasWidth / zoom / 2), [canvasWidth, zoom]);
    const halfScreenWidth = useMemo(() => canvasWidth / zoom / 2, [canvasWidth, zoom]);

    return {
        borderLeftPosition,
        halfScreenWidth
    };
};
