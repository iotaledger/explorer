import { Block, BlockMetadataResponse, SlotIndex } from "@iota/sdk-wasm-nova/web";

interface IFeedBlockUpdate {
    blockId: string;
    block: Block;
}

export interface IFeedUpdate {
    subscriptionId: string;
    blockUpdate?: IFeedBlockUpdate;
    blockMetadataUpdate?: BlockMetadataResponse;
    slotFinalized?: SlotIndex;
}
