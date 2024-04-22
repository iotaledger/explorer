import { Block, MilestonePayload } from "@iota/sdk-wasm-stardust/web";
import { IFeedBlockMetadata } from "./IFeedBlockMetadata";

type IFeedBlockUpdate = Block;

interface IFeedBlockMetadataUpdate {
    blockId: string;
    metadata: IFeedBlockMetadata;
}

interface IFeedMilestoneUpdate {
    blockId: string;
    milestoneId: string;
    milestoneIndex: number;
    payload: MilestonePayload;
    timestamp: number;
}

export interface IFeedUpdate {
    subscriptionId: string;
    block?: IFeedBlockUpdate;
    blockMetadata?: IFeedBlockMetadataUpdate;
    milestone?: IFeedMilestoneUpdate;
}
