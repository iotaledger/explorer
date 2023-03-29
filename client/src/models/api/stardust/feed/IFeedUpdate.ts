import { IFeedBlockMetadata } from "./IFeedBlockMetadata";

type IFeedBlockUpdate = string;

interface IFeedBlockMetadataUpdate {
    blockId: string;
    metadata: IFeedBlockMetadata;
}

export interface IFeedUpdate {
    subscriptionId: string;
    block?: IFeedBlockUpdate;
    blockMetadata?: IFeedBlockMetadataUpdate;
}

