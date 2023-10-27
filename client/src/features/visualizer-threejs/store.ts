import { create } from "zustand";
import { ZOOM_DEFAULT } from "./constants";
import { getScaleMultiplier } from "./utils";

interface BlockState {
    id: string;
    position: [x: number, y: number, z: number];
}

interface BlockOptions {
    color: string;
    scale: number;
}
interface BlockStoreState {
    blocks: BlockState[];
    blockOptions: { [k: string]: BlockOptions };
    addBlock: (newBlock: BlockState, options: BlockOptions) => void;
    removeBlocks: (blockId: string[]) => void;
    removeBlock: (blockId: string) => void;
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
    blocks: [],
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
                blocks: [...state.blocks, newBlock],
                blockOptions: {
                    ...state.blockOptions,
                    [newBlock.id]: { ...prevBlockOptions, ...options }
                }
            };
        });
    },
    removeBlocks: (blockIds: string[]) => {
        set(state => {
            const nextBlockOptions = { ...state.blockOptions };
            for (const blockId of blockIds) {
                delete nextBlockOptions[blockId];
            }
            return {
                blocks: [...state.blocks.filter(b => !blockIds.includes(b.id))],
                blockOptions: nextBlockOptions
            };
        });
    },
    removeBlock: (blockId: string) => {
        set(state => {
            const nextBlockOptions = { ...state.blockOptions };
            delete nextBlockOptions[blockId];
            return {
                blocks: [...state.blocks.filter(b => b.id !== blockId)],
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
