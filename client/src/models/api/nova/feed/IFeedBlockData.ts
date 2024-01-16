import { Block } from "@iota/sdk-wasm-nova/web";

export interface IFeedBlockData {
    /**
     * The block id.
     */
    blockId: string;

    /**
     * The block.
     */
    block: Block;
}
