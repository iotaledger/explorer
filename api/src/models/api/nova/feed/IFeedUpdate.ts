/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Block, IBlockMetadata, SlotIndex } from "@iota/sdk-nova";

interface IFeedBlockUpdate {
    blockId: string;
    block: Block;
}

export interface IFeedUpdate {
    subscriptionId: string;
    blockUpdate?: IFeedBlockUpdate;
    blockMetadataUpdate?: IBlockMetadata;
    slotFinalized?: SlotIndex;
}
