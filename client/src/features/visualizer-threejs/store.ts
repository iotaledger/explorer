import { create } from "zustand";

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
}

export const useBlockStore = create<BlockStoreState>(set => ({
    blocks: [],
    blockOptions: {},
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
    addParents: (blockId, parents) => {
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
    }
}));
