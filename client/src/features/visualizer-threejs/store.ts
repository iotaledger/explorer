import { create } from "zustand";

interface BlockState {
    id: string;
    position: [x: number, y: number, z: number];
    color: string;
}

interface BlockStoreState {
    blocks: BlockState[];
    addBlock: (newBlock: BlockState) => void;
    removeBlock: (blockId: string) => void;
}

export const useBlockStore = create<BlockStoreState>(set => ({
    blocks: [],
    addBlock: (newBlock: BlockState) => {
        set(state => ({ blocks: [...state.blocks, newBlock] }));
    },
    removeBlock: (blockId: string) => {
        set(state => ({ blocks: [...state.blocks.filter(b => b.id !== blockId)] }));
    }
}));

