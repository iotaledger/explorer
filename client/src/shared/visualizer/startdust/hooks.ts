import React, { useEffect } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { StardustFeedClient } from "../../../services/stardust/stardustFeedClient";
import { TFeedBlockAdd, TFeedBlockMetadataUpdate } from "./types";


export interface UpdateListenerReturn {
    onNewExists: boolean;
    setOnNewExists: React.Dispatch<React.SetStateAction<boolean>>;
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
    handlerNewBlock?: TFeedBlockAdd,
    handlerUpdateBlock?: TFeedBlockMetadataUpdate
): UpdateListenerReturn => {
    const [onNewExists, setOnNewExists] = React.useState<boolean>(false);
    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );
        if (feedService && onNewExists && handlerNewBlock) {
            feedService.subscribeBlocks(
                handlerNewBlock,
                handlerUpdateBlock
            );
        }
    }, [onNewExists]);
    return {
        onNewExists,
        setOnNewExists
    };
};
