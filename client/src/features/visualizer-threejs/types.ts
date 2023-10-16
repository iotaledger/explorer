import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";

export type TFeedBlockAdd = (newBlock: IFeedBlockData) => void;

export type TFeedBlockMetadataUpdate = (metadataUpdate: {
    [id: string]: IFeedBlockMetadata;
}) => void;
