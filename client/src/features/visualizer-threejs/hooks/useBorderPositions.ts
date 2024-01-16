import { useMemo } from "react";
import { useTangleStore, useConfigStore } from "../store";

export const useBorderPositions = () => {
    const zoom = useTangleStore((s) => s.zoom);
    const canvasWidth = useConfigStore((state) => state.dimensions.width);

    const halfScreenWidth = useMemo(() => canvasWidth / zoom / 2, [canvasWidth, zoom]);

    return {
        halfScreenWidth,
    };
};
