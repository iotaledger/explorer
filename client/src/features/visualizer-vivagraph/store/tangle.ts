import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";

interface TangleState {
    blockIdToMetadata: Map<string, IFeedBlockData>;
    createBlockIdToMetadata: (blockId: string, metadata: IFeedBlockData) => void;
    getBlockIdToMetadata: (blockId: string) => IFeedBlockData | undefined;
    updateBlockIdToMetadata: (blockId: string, metadata: Partial<IFeedBlockData>) => void;
    getExistingBlockIds: () => string[];
}

const INITIAL_STATE = {
    blockIdToMetadata: new Map(),
};

export const useTangleStore = create<TangleState>()(
    devtools((set, get) => ({
        ...INITIAL_STATE,

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
        getExistingBlockIds: () => {
            return Array.from(get().blockIdToMetadata.keys());
        },
    })),
);
