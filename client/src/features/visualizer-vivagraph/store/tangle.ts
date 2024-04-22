import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";
import { BlockId, BlockState, SlotIndex } from "@iota/sdk-wasm-nova/web";

export interface VivagraphParams {
    color: string;
    state: BlockState;
}

interface TangleState {
    blockIdToMetadata: Map<string, IFeedBlockData & VivagraphParams>;
    createBlockIdToMetadata: (blockId: string, metadata: IFeedBlockData & VivagraphParams) => void;
    getBlockIdToMetadata: (blockId: string) => (IFeedBlockData & VivagraphParams) | undefined;
    updateBlockIdToMetadata: (blockId: string, metadata: Partial<IFeedBlockData & VivagraphParams>) => void;
    deleteBlockIdToMetadata: (blockId: string) => void;
    getBlockMetadataKeys: () => string[];
    getBlockMetadataValues: () => (IFeedBlockData & VivagraphParams)[];

    visibleBlocks: string[];
    setVisibleBlocks: (blockIds: string[]) => void;
    getVisibleBlocks: () => string[];

    selectedNode: IFeedBlockData | null;
    setSelectedNode: (block: IFeedBlockData | null) => void;

    search: string;
    setSearch: (search: string) => void;

    resetTangleStore: () => void;

    // Confirmed/accepted blocks by slot
    confirmedBlocksBySlot: Map<number, string[]>;
    addToConfirmedBlocksBySlot: (blockId: BlockId, slot: SlotIndex) => void;
    removeConfirmedBlocksSlot: (slot: SlotIndex) => void;
}

const INITIAL_STATE = {
    blockIdToMetadata: new Map(),
    visibleBlocks: [],
    selectedNode: null,
    search: "",
    confirmedBlocksBySlot: new Map(),
};

export const useTangleStore = create<TangleState>()(
    devtools((set, get) => ({
        ...INITIAL_STATE,
        resetTangleStore: () => {
            set(() => {
                return {
                    blockIdToMetadata: new Map(),
                    visibleBlocks: [],
                    selectedNode: null,
                    search: "",
                    confirmedBlocksBySlot: new Map(),
                };
            });
        },
        setSearch: (search) => {
            set(() => {
                return {
                    search,
                };
            });
        },
        setSelectedNode: (block) => {
            set(() => {
                return {
                    selectedNode: block,
                };
            });
        },
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
        getBlockMetadataKeys: () => {
            return Array.from(get().blockIdToMetadata.keys());
        },
        getBlockMetadataValues: () => {
            return Array.from(get().blockIdToMetadata.values());
        },

        addToConfirmedBlocksBySlot: (blockId, slot) => {
            set((state) => {
                state.confirmedBlocksBySlot.has(slot)
                    ? state.confirmedBlocksBySlot.get(slot)?.push(blockId)
                    : state.confirmedBlocksBySlot.set(slot, [blockId]);
                return {
                    ...state,
                    confirmedBlocksBySlot: state.confirmedBlocksBySlot,
                };
            });
        },

        removeConfirmedBlocksSlot: (slot) => {
            set((state) => {
                state.confirmedBlocksBySlot.delete(slot);

                // Cleanup all slots that are lower than the current slot
                for (const existingSlot of state.confirmedBlocksBySlot.keys()) {
                    if (existingSlot < slot) {
                        state.confirmedBlocksBySlot.delete(existingSlot);
                    }
                }

                return {
                    ...state,
                    confirmedBlocksBySlot: state.confirmedBlocksBySlot,
                };
            });
        },
    })),
);
