import { useTangleStore, useConfigStore, IAddToColorQueueBulkItem } from "~features/visualizer-threejs/store";

const usePlayPause = () => {
    const isPlaying = useConfigStore((state) => state.isPlaying);
    const setIsPlaying = useConfigStore((state) => state.setIsPlaying);
    const visibleBlockIdsOnPause = useTangleStore((state) => state.visibleBlockIdsOnPause);
    const addToColorQueueBulk = useTangleStore((state) => state.addToColorQueueBulk);
    const setVisibleBlockIdsOnPause = useTangleStore((state) => state.setVisibleBlockIdsOnPause);
    const blockMetadata = useTangleStore((state) => state.blockMetadata);

    const onToggle = () => {
        if (isPlaying) {
            const visibleBlockIds = blockMetadata.keys();
            setIsPlaying(false);
            setVisibleBlockIdsOnPause([...visibleBlockIds]);
        } else {
            const updateColors =
                visibleBlockIdsOnPause?.reduce<IAddToColorQueueBulkItem[]>((acc, id) => {
                    const color = blockMetadata.get(id)?.treeColor;

                    if (color) {
                        acc.push({ id, color });
                    }

                    return acc;
                }, []) || [];

            addToColorQueueBulk(updateColors);
            setVisibleBlockIdsOnPause(undefined);
            setIsPlaying(true);
        }
    };

    return {
        onToggle,
    };
};

export default usePlayPause;
