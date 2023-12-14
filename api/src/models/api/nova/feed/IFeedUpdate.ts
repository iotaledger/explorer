import { Block } from "@iota/sdk-nova";

interface IFeedBlockUpdate {
    blockId: string;
    block: Block;
}

export interface IFeedUpdate {
    subscriptionId: string;
    blockUpdate?: IFeedBlockUpdate;
}

