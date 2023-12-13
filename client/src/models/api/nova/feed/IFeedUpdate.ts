import { Block } from "@iota/sdk-wasm-nova/web";

type IFeedBlockUpdate = Block;

export interface IFeedUpdate {
    subscriptionId: string;
    block?: IFeedBlockUpdate;
}

