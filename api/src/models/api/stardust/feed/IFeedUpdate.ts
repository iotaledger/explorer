import { IMilestonePayload } from "@iota/iota.js-stardust";
import { IFeedItemMetadata } from "./IFeedItemMetadata";

type IFeedBlockUpdate = string;

interface IFeedBlockMetadataUpdate {
    blockId: string;
    metadata: IFeedItemMetadata;
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

