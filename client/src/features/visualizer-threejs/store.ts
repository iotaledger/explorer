import { Color } from "three";
import { create } from "zustand";
import { ZOOM_DEFAULT } from "./constants";
import { getScaleMultiplier } from "./utils";

interface BlockState {
    id: string;
    position: [x: number, y: number, z: number];
}

interface BlockOptions {
    color: Color;
    scale: number;
}

interface BlockStoreState {
    blocksToAdd: BlockState[];
    addBlock: (newBlock: BlockState, options: BlockOptions) => void;
    removeBlock: (blockId: string) => void;
    removeBlocks: (blockIds: string[]) => void;

    blocksForUpdate: BlockState[];
    blockOptions: { [k: string]: BlockOptions };
    addParents: (blockId: string, parents: string[]) => void;

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
    blocksToAdd: [],
    blocksForUpdate: [],
    blockOptions: {},
    yPositions: {},
    zoom: ZOOM_DEFAULT,
    dimensions: { width: 0, height: 0 },
    isPlaying: false,
    bps: 0,
    addBlock: (newBlock, options) => {
        set(state => {
            const prevBlockOptions = state.blockOptions[newBlock.id] || {};
            return {
                blocksToAdd: [...state.blocksToAdd, newBlock],
                blockOptions: {
                    ...state.blockOptions,
                    [newBlock.id]: { ...prevBlockOptions, ...options }
                }
            };
        });
    },
    removeBlocks: (blockIds: string[]) => {
        set(state => ({
                ...state,
                blocksToAdd: [...state.blocksToAdd.filter(b => !blockIds.includes(b.id))]
            }));
    },
    removeBlock: (blockId: string) => {
        set(state => {
            const nextBlockOptions = { ...state.blockOptions };
            delete nextBlockOptions[blockId];
            return {
                blocksToAdd: [...state.blocksToAdd.filter(b => b.id !== blockId)],
                blockOptions: nextBlockOptions
            };
        });
    },
    addParents: parents => {
        set(state => {
            for (const parentId of parents) {
                const foundParent = state.blockOptions[parentId];

                if (foundParent) {
                    foundParent.scale += 0.1;
                }
            }
            return {
                ...state,
                blockOptions: {
                    ...state.blockOptions
                }
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
