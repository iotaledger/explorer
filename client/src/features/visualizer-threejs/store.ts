import { create } from "zustand";
import { ZOOM_DEFAULT } from "../../shared/visualizer/common/constants";
import { getScaleMultiplier } from "../../shared/visualizer/common/utils";

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
    removeBlock: (blockId: string) => void;
    addParents: (blockId: string, parents: string[]) => void;

    yPositions: { [k: number]: number };
    addYPosition: (blockY: number) => void;
    removeYPosition: (blockY: number) => void;

    zoom: number;
    checkZoom: () => void;

    dimensions: { width: number; height: number };
    setDimensions: (width: number, height: number) => void;
}

export const useBlockStore = create<BlockStoreState>(set => ({
    blocks: [],
    blockOptions: {},
    yPositions: {},
    zoom: 4,
    dimensions: { width: 0, height: 0 },

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
    setDimensions: (width, height) => {
        set(state => ({
                ...state,
                dimensions: { width, height }
            })
        );
    }
}));
