import { create } from "zustand";

import { randomIntFromInterval } from "../../shared/visualizer/common/utils";
import { colors } from "../../shared/visualizer/common/constants";

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
    // blocks: [
    //     {
    //         id: "dummy-block-1",
    //         position: [randomIntFromInterval(180, 210), randomIntFromInterval(-50, 50), -10],
    //         color: colors[randomIntFromInterval(0, colors.length - 1)]
    //     },
    //     {
    //         id: "dummy-block-2",
    //         position: [randomIntFromInterval(180, 210), randomIntFromInterval(-50, 50), -10],
    //         color: colors[randomIntFromInterval(0, colors.length - 1)]
    //     }
    // ],
    blocks: [],
    addBlock: (newBlock: BlockState) => {
        set(state => ({ blocks: [...state.blocks, newBlock] }));
    },
    removeBlock: (blockId: string) => {
        set(state => ({ blocks: [...state.blocks.filter(b => b.id !== blockId)] }));
    }
}));

