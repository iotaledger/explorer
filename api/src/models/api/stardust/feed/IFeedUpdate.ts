import { IFeedItemMetadata } from "./IFeedItemMetadata";

type IFeedBlockUpdate = string;

interface IFeedBlockMetadataUpdate {
    blockId: string;
    metadata: IFeedItemMetadata;
}

export interface IFeedUpdate {
    subscriptionId: string;
    block?: IFeedBlockUpdate;
    blockMetadata?: IFeedBlockMetadataUpdate;
}

