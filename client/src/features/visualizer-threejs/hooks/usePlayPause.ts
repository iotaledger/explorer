import { useTangleStore, useConfigStore } from "~features/visualizer-threejs/store";

const usePlayPause = () => {
    const isPlaying = useConfigStore((state) => state.isPlaying);
    const setIsPlaying = useConfigStore((state) => state.setIsPlaying);
    const visibleBlockIdsOnPause = useTangleStore((state) => state.visibleBlockIdsOnPause);
    const setVisibleBlockIdsOnPause = useTangleStore((state) => state.setVisibleBlockIdsOnPause);
    const blockMetadata = useTangleStore((state) => state.blockMetadata);

    const onToggle = () => {
        if (isPlaying) {
            const visibleBlockIds = blockMetadata.keys();
            setIsPlaying(false);
            setVisibleBlockIdsOnPause([...visibleBlockIds]);
        } else {
            setVisibleBlockIdsOnPause(undefined);
            setIsPlaying(true);
        }
    }

    return {
        onToggle
    }
};

export default usePlayPause;
