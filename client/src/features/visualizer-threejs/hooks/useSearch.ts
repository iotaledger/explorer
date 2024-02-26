// import React from "react";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";
import useSearchStore from "~features/visualizer-threejs/store/search";
import { useTangleStore } from "~features/visualizer-threejs/store";
import { SEARCH_RESULT_COLOR } from "~features/visualizer-threejs/constants";

export const useSearch = () => {
    const searchQuery = useSearchStore((state) => state.searchQuery);
    const addToColorQueue = useTangleStore((s) => s.addToColorQueue);

    const isSearchMatch = (block: IFeedBlockData) => {
        const searchQuery = useSearchStore.getState().searchQuery;
        return matchLatestFinalizedSlot(block, searchQuery) || matchByBlockId(block, searchQuery);
    };

    const highlightSearchBlock = (blockId: string) => {
        useSearchStore.getState().addMatchingBlockId(blockId);
        addToColorQueue(blockId, SEARCH_RESULT_COLOR);
    };

    return {
        searchQuery,
        isSearchMatch,
        highlightSearchBlock,
    };
};

export function isSearchMatch(block: IFeedBlockData, searchQuery: string) {
    return matchLatestFinalizedSlot(block, searchQuery) || matchByBlockId(block, searchQuery);
}

export function matchByBlockId(block: IFeedBlockData, searchQuery: string) {
    return block.blockId === searchQuery;
}

export function matchLatestFinalizedSlot(block: IFeedBlockData, searchQuery: string) {
    if (!searchQuery || Number.isNaN(Number(searchQuery))) {
        return false;
    }

    const latestFinalizedSlot = block?.block?.header?.latestFinalizedSlot;

    return latestFinalizedSlot === Number(searchQuery);
}
