import { Color } from "three";
import { create } from "zustand";
import { ZOOM_DEFAULT } from "./constants";
import { getScaleMultiplier } from "./utils";

interface BlockState {
    id: string;
    position: [x: number, y: number, z: number];
    color: Color;
}

interface BlockStoreState {
    // Queue for "add block" operation to the canvas
    blockQueue: BlockState[];
    addToBlockQueue: (newBlock: BlockState) => void;
    removeFromBlockQueue: (blockIds: string[]) => void;

    scaleQueue: string[];
    addToScaleQueue: (blockId: string, parents: string[]) => void;
    removeFromScaleQueue: () => void;

    // Map of blockId to index in Tangle 'InstancedMesh'
    blockIdToIndex: Map<string, number>;
    indexToBlockId: string[];
    updateBlockIdToIndex: (blockId: string, index: number) => void;

    yPositions: { [k: number]: number };
    addYPosition: (blockY: number) => void;
    removeYPosition: (blockY: number) => void;

    zoom: number;
    checkZoom: () => void;
    setZoom: (zoom: number) => void;

    dimensions: { width: number; height: number };
    setDimensions: (width: number, height: number) => void;

    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;

    bps: number;
    setBps: (bps: number) => void;
}

export const useBlockStore = create<BlockStoreState>(set => ({
    blockQueue: [],
    scaleQueue: [],
    blockIdToIndex: new Map(),
    indexToBlockId: [],
    yPositions: {},
    zoom: ZOOM_DEFAULT,
    dimensions: { width: 0, height: 0 },
    isPlaying: false,
    bps: 0,
    addToBlockQueue: newBlockData => {
        set(state => ({
            blockQueue: [...state.blockQueue, newBlockData]
        }));
    },
    removeFromBlockQueue: (blockIds: string[]) => {
        set(state => ({
            ...state,
            blockQueue: [...state.blockQueue.filter(b => !blockIds.includes(b.id))]
        }));
    },
    addToScaleQueue: (_: string, parents) => {
        if (parents.length > 0) {
            set(state => {
                const nextScalesToUpdate = [...state.scaleQueue, ...parents];

                return {
                    ...state,
                    scaleQueue: nextScalesToUpdate
                };
            });
        }
    },
    removeFromScaleQueue: () => {
        set(state => ({
            ...state,
            scaleQueue: []
        }));
    },
    updateBlockIdToIndex: (blockId: string, index: number) => {
        set(state => {
            state.blockIdToIndex.set(blockId, index);
            const nextIndexToBlockId = [...state.indexToBlockId];

            // Clean up map from old blockIds
            if (nextIndexToBlockId[index]) {
                state.blockIdToIndex.delete(nextIndexToBlockId[index]);
            }

            nextIndexToBlockId[index] = blockId;

            return {
                ...state,
                indexToBlockId: nextIndexToBlockId
            };
        });
    },
    addYPosition: blockY => {
        const Y = Math.floor(Math.abs(blockY));

        set(state => {
            const nextYPositions = { ...state.yPositions };

            const prevYCount = nextYPositions[Y] || 0;
            nextYPositions[Y] = prevYCount + 1;
            return {
                ...state,
                yPositions: nextYPositions
            };
        });
    },
    removeYPosition: blockY => {
        const Y = Math.floor(Math.abs(blockY));

        set(state => {
            const nextYPositions = { ...state.yPositions };
            const current = nextYPositions[Y];
            if (current === 1) {
                delete nextYPositions[Y];
            } else {
                nextYPositions[Y] -= 1;
            }
            return {
                ...state,
                yPositions: nextYPositions
            };
        });
    },
    checkZoom: () => {
        set(state => {
            const yPositions = Object.keys(state.yPositions).map(Number);
            const multiplier = getScaleMultiplier(yPositions, state.dimensions.height);

            return {
                ...state,
                zoom: multiplier
            };
        });
    },
    setZoom: zoom => {
        set(state => ({
            ...state,
            zoom
        }));
    },
    setDimensions: (width, height) => {
        set(state => ({
            ...state,
            dimensions: { width, height }
        })
        );
    },
    setIsPlaying: isPlaying => {
        set(state => ({
            ...state,
            isPlaying
        }));
    },
    setBps: bps => {
        set(state => ({
            ...state,
            bps
        }));
    }
}));

