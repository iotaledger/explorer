import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";

interface TangleState {
    blockIdToMetadata: Map<string, IFeedBlockData>;
    createBlockIdToMetadata: (blockId: string, metadata: IFeedBlockData) => void;
    getBlockIdToMetadata: (blockId: string) => IFeedBlockData | undefined;
    updateBlockIdToMetadata: (blockId: string, metadata: Partial<IFeedBlockData>) => void;
    deleteBlockIdToMetadata: (blockId: string) => void;
    getExistingBlockIds: () => string[];

    visibleBlocks: string[];
    setVisibleBlocks: (blockIds: string[]) => void;
    getVisibleBlocks: () => string[];
}

const INITIAL_STATE = {
    blockIdToMetadata: new Map(),
    visibleBlocks: [],
};

export const useTangleStore = create<TangleState>()(
    devtools((set, get) => ({
        ...INITIAL_STATE,

        setVisibleBlocks: (blockIds) => {
            set(() => {
                return {
                    visibleBlocks: blockIds,
                };
            });
        },
        getVisibleBlocks: () => {
            return get().visibleBlocks;
        },
        createBlockIdToMetadata: (blockId, metadata) => {
            get().blockIdToMetadata.set(blockId, metadata);
        },
        getBlockIdToMetadata: (blockId) => {
            return get().blockIdToMetadata.get(blockId);
        },
        updateBlockIdToMetadata: (blockId, metadata) => {
            const blockMetadata = get().blockIdToMetadata;
            const currentMetadata = blockMetadata.get(blockId);
            if (currentMetadata) {
                const newMetadata = { ...currentMetadata, ...metadata };
                blockMetadata.set(blockId, newMetadata);
            }
        },
        deleteBlockIdToMetadata: (blockId) => {
            const blockMetadata = get().blockIdToMetadata;
            blockMetadata.delete(blockId);
        },
        getExistingBlockIds: () => {
            return Array.from(get().blockIdToMetadata.keys());
        },
    })),
);
