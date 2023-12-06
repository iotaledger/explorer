import { Block } from "@iota/sdk-nova";

type IFeedBlockUpdate = Block;

export interface IFeedUpdate {
    subscriptionId: string;
    block?: IFeedBlockUpdate;
}

