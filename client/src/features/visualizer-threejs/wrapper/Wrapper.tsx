import React from "react";
import Modal from "~/app/components/Modal";
import { TSelectFeedItemNova, TSelectNode } from "~/app/types/visualizer.types";
import { INetwork } from "~/models/config/INetwork";
import { KeyPanel } from "./KeyPanel";
import mainHeader from "~assets/modals/visualizer/main-header.json";
import { SelectedFeedInfo } from "./SelectedFeedInfo";
import { StatsPanel } from "./StatsPanel";
import useSearchStore from "~features/visualizer-threejs/store/search";
import { useTangleStore } from "~features/visualizer-threejs/store/tangle";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";
import { SEARCH_RESULT_COLOR } from "~features/visualizer-threejs/constants";
import { Color } from "three";

export const Wrapper = ({
    blocksCount,
    children,
    isPlaying,
    network,
    networkConfig,
    selectedFeedItem,
    setIsPlaying,
    isEdgeRenderingEnabled,
    setEdgeRenderingEnabled,
}: {
    readonly blocksCount: number;
    readonly children: React.ReactNode;
    readonly isPlaying: boolean;
    readonly network: string;
    readonly networkConfig: INetwork;
    readonly selectNode: TSelectNode;
    readonly selectedFeedItem: TSelectFeedItemNova;
    readonly setIsPlaying: (isPlaying: boolean) => void;
    readonly isEdgeRenderingEnabled?: boolean;
    readonly setEdgeRenderingEnabled?: (isEnabled: boolean) => void;
}) => {
    const searchQuery = useSearchStore((state) => state.searchQuery);
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    const matchingBlockIds = useSearchStore((state) => state.matchingBlockIds);
    const setMatchingBlockIds = useSearchStore((state) => state.setMatchingBlockIds);
    const blockMetadata = useTangleStore((state) => state.blockMetadata);
    const addToColorQueueBulk = useTangleStore((s) => s.addToColorQueueBulk);


    const matchLatestFinalizedSlot = React.useCallback((block: IFeedBlockData, searchQuery: string) => {
        if (!searchQuery || Number.isNaN(Number(searchQuery))) {
            return false;
        }

        const latestFinalizedSlot = block?.block?.header?.latestFinalizedSlot;

        return latestFinalizedSlot === Number(searchQuery);
    }, []);

    React.useEffect(() => {
        // [] Search empty - put value
            // [] check matches
            // [] if matches - add to color queue
        // [] Search empty - remove value
            // [] remove from color queue
        // [] Search not empty - put value
            // [] check matches
            // [] if matches - add to color queue

        const colorsQueue = [];

        const tempMatchingBlockIds: string[] = [];

        blockMetadata.forEach((i) => {
            if (matchLatestFinalizedSlot(i, searchQuery)) {
                tempMatchingBlockIds.push(i.blockId);
            }
        });


        // before we need to clear the previous search results
        if (matchingBlockIds.length > 0) {
            matchingBlockIds.forEach((id) => {
                const metadata = blockMetadata.get(id);
                const treeColor = metadata?.treeColor as Color;
                if (treeColor) {
                    colorsQueue.push({id: id, color: treeColor});
                }
            });
        }

        if (tempMatchingBlockIds.length > 0) {
            colorsQueue.push(...tempMatchingBlockIds.map((id) => ({id: id, color: SEARCH_RESULT_COLOR})));
        }

        addToColorQueueBulk(colorsQueue);
        setMatchingBlockIds(tempMatchingBlockIds);
    }, [searchQuery]);

    React.useEffect(() => {

    }, [matchingBlockIds]);


    return (
        <div className="visualizer-nova">
            <div className="row middle">
                <div className="row middle heading margin-r-t margin-b-t">
                    <h1>Visualizer</h1>
                    <Modal icon="info" data={mainHeader} />
                </div>
                <div className="card search-filter fill">
                    <div className="card--content row middle">
                        <div className="card--label margin-r-s">Search</div>
                        <input className="input form-input-long" type="text" value={searchQuery} onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }} maxLength={2000} />
                    </div>
                </div>
            </div>
            <div className="graph-border">
                {children}
                <div className="action-panel-container">
                    <div className="card">
                        <button className="pause-button" type="button" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <span className="material-icons">pause</span> : <span className="material-icons">play_arrow</span>}
                        </button>
                    </div>
                    {isEdgeRenderingEnabled !== undefined && setEdgeRenderingEnabled !== undefined && (
                        <div className="margin-l-t row middle">
                            <h3>Show edges:</h3>
                            <input
                                type="checkbox"
                                className="margin-l-t"
                                checked={isEdgeRenderingEnabled}
                                onChange={({ target: { checked } }) => setEdgeRenderingEnabled(checked)}
                            />
                        </div>
                    )}
                </div>
            </div>
            <StatsPanel blocksCount={blocksCount} network={network} />
            {selectedFeedItem && <SelectedFeedInfo networkConfig={networkConfig} network={network} selectedFeedItem={selectedFeedItem} />}
            <KeyPanel />
        </div>
    );
};

Wrapper.defaultProps = {
    isEdgeRenderingEnabled: undefined,
    setEdgeRenderingEnabled: undefined,
};
