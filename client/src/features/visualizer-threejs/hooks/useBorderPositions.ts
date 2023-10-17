import { useBlockStore } from "../store";

export const useBorderPositions = () => {
    const zoom = useBlockStore(s => s.zoom);
    const canvasWidth = useBlockStore(state => state.dimensions.width);

    return {
        borderLeftPosition: -(canvasWidth / zoom / 2)
    };
};
