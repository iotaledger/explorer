import { Block, MilestonePayload } from "@iota/iota.js-stardust";
import { IFeedItemMetadata } from "./IFeedItemMetadata";

type IFeedBlockUpdate = Block;

interface IFeedBlockMetadataUpdate {
    blockId: string;
    metadata: IFeedItemMetadata;
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

