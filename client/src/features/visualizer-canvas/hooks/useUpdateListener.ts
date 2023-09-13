import { useEffect } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IFeedBlockData } from "../../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../../models/api/stardust/feed/IFeedBlockMetadata";
import { StardustFeedClient } from "../../../services/stardust/stardustFeedClient";

export type TBlockAdd = (newBlock: IFeedBlockData) => void;
export type TBlockMetaUpdate = (metadataUpdate: {
    [id: string]: IFeedBlockMetadata;
}) => void;

export const useUpdateListener = (
    network: string,
    handlerNewBlock?: TBlockAdd,
    handlerUpdateBlock?: TBlockMetaUpdate
) => {
    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );

        if (feedService) {
            feedService.subscribeBlocks(handlerNewBlock, handlerUpdateBlock);
        }
    }, []);
    return {};
};