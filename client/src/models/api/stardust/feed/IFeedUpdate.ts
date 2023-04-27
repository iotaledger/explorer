import { IMilestonePayload } from "@iota/iota.js-stardust";
import { IFeedBlockMetadata } from "./IFeedBlockMetadata";

type IFeedBlockUpdate = string;

interface IFeedBlockMetadataUpdate {
    blockId: string;
    metadata: IFeedBlockMetadata;
}

interface IFeedMilestoneUpdate {
    blockId: string;
    milestoneId: string;
    milestoneIndex: number;
    payload: IMilestonePayload;
    timestamp: number;
}

export interface IFeedUpdate {
    subscriptionId: string;
    block?: IFeedBlockUpdate;
    blockMetadata?: IFeedBlockMetadataUpdate;
    milestone?: IFeedMilestoneUpdate;
}

