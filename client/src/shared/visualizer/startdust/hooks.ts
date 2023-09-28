import React, { useEffect } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { StardustFeedClient } from "../../../services/stardust/stardustFeedClient";
import { TFeedBlockAdd, TFeedBlockMetadataUpdate } from "./types";

export const useUpdateListener = (
    network: string,
    handlerNewBlock?: React.RefObject<TFeedBlockAdd>,
    handlerUpdateBlock?: TFeedBlockMetadataUpdate
) => {
    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );
        console.log('--- ', handlerNewBlock?.current);
        if (feedService && handlerNewBlock?.current) {
            feedService.subscribeBlocks(
                handlerNewBlock.current,
                handlerUpdateBlock
            );
        }
    }, [handlerNewBlock, handlerNewBlock?.current]);
    return {};
};
