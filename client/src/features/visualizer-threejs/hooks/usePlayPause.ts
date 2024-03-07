import { useTangleStore, useConfigStore, IAddToColorQueueBulkItem } from "~features/visualizer-threejs/store";

const usePlayPause = () => {
    const isPlaying = useConfigStore((state) => state.isPlaying);
    const setIsPlaying = useConfigStore((state) => state.setIsPlaying);
    const addToColorQueueBulk = useTangleStore((state) => state.addToColorQueueBulk);
    const setVisibleBlockIdsOnPause = useTangleStore((state) => state.setVisibleBlockIdsOnPause);
    const blockMetadata = useTangleStore((state) => state.blockMetadata);

    const onToggle = () => {
        if (isPlaying) {
            const visibleBlockIds = blockMetadata.keys();
            setIsPlaying(false);
            setVisibleBlockIdsOnPause([...visibleBlockIds]);
        } else {
            const colorsQueue: IAddToColorQueueBulkItem[] = [];
            blockMetadata.forEach((metadata, id) => {
                if (metadata.treeColor) {
                    colorsQueue.push({ id, color: metadata.treeColor });
                }
            });
            addToColorQueueBulk(colorsQueue);
            setVisibleBlockIdsOnPause(undefined);
            setIsPlaying(true);
        }
    };

    return {
        onToggle,
    };
};

export default usePlayPause;
