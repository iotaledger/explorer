import React, { useEffect } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { StardustFeedClient } from "../../../services/stardust/stardustFeedClient";
import { TFeedBlockAdd, TFeedBlockMetadataUpdate } from "./types";


export interface UpdateListenerReturn<T> {
    onNewBlock?: TFeedBlockAdd;
    setOnNewBlock: React.Dispatch<React.SetStateAction<T | TFeedBlockAdd | undefined>>;
}

/**
* Hook for subscribe to new blocks.
* @param network - .
* @param handlerNewBlock - .
* @param handlerUpdateBlock - .
* @returns - .
*/
export const useUpdateListener = (
    network: string,
    handlerNewBlock?: React.RefObject<TFeedBlockAdd>,
    handlerUpdateBlock?: TFeedBlockMetadataUpdate
): UpdateListenerReturn<() => void> => {
    const [onNewBlock, setOnNewBlock] = React.useState<TFeedBlockAdd>();
    
    console.log('--- onNewBlock', onNewBlock);

    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );
        if (feedService && onNewBlock) {
            feedService.subscribeBlocks(
                onNewBlock,
                handlerUpdateBlock
            );
        }
    }, [onNewBlock]);
    return {
        onNewBlock,
        setOnNewBlock
    };
};
