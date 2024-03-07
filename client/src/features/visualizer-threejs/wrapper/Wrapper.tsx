import React from "react";
import Modal from "~/app/components/Modal";
import { TSelectFeedItemNova, TSelectNode } from "~/app/types/visualizer.types";
import { INetwork } from "~/models/config/INetwork";
import KeyPanel from "./KeyPanel";
import mainHeader from "~assets/modals/visualizer/main-header.json";
import { SelectedFeedInfo } from "./SelectedFeedInfo";
import ConfigControls from "../ConfigControls";
import useSearchStore from "~features/visualizer-threejs/store/search";
import { useTangleStore } from "~features/visualizer-threejs/store/tangle";
import { SEARCH_RESULT_COLOR, features } from "~features/visualizer-threejs/constants";
import { isSearchMatch } from "~features/visualizer-threejs/hooks/useSearch";
import usePlayPause from "~features/visualizer-threejs/hooks/usePlayPause";
import { ThemeMode } from "../enums";

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
    themeMode,
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
    readonly themeMode: ThemeMode;
}) => {
    const searchQuery = useSearchStore((state) => state.searchQuery);
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    const matchingBlockIds = useSearchStore((state) => state.matchingBlockIds);
    const setMatchingBlockIds = useSearchStore((state) => state.setMatchingBlockIds);
    const blockMetadata = useTangleStore((state) => state.blockMetadata);
    const addToColorQueueBulk = useTangleStore((s) => s.addToColorQueueBulk);
    const { onToggle } = usePlayPause();

    React.useEffect(() => {
        const colorsQueue = [];

        const tempMatchingBlockIds: string[] = [];

        blockMetadata.forEach((i) => {
            if (isSearchMatch(i, searchQuery)) {
                tempMatchingBlockIds.push(i.blockId);
            }
        });

        // before we need to clear the previous search results
        if (matchingBlockIds.length > 0) {
            matchingBlockIds.forEach((id) => {
                const metadata = blockMetadata.get(id);
                const treeColor = metadata?.treeColor;
                if (treeColor) {
                    colorsQueue.push({ id: id, color: treeColor });
                }
            });
        }

        if (tempMatchingBlockIds.length > 0) {
            colorsQueue.push(...tempMatchingBlockIds.map((id) => ({ id: id, color: SEARCH_RESULT_COLOR })));
        }

        addToColorQueueBulk(colorsQueue);
        setMatchingBlockIds(tempMatchingBlockIds);
    }, [searchQuery]);

    return (
        <>
            <div className="visualizer-nova">
                <div className="row middle">
                    <div className="row middle heading margin-r-t margin-b-t">
                        <h1>Visualizer</h1>
                        <Modal icon="info" data={mainHeader} />
                    </div>
                    <div className="card search-filter fill">
                        <div className="card--content row middle">
                            <div className="card--label margin-r-s">Search</div>
                            <input
                                className="input form-input-long"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                                maxLength={2000}
                            />
                        </div>
                    </div>
                </div>
                <div className="graph-border">
                    {children}
                    <div className="action-panel-container">
                        <div className="card">
                            <button className="pause-button" type="button" onClick={onToggle}>
                                {isPlaying ? (
                                    <span className="material-icons">pause</span>
                                ) : (
                                    <span className="material-icons">play_arrow</span>
                                )}
                            </button>
                        </div>
                        {features.showEdgeRenderingCheckbox &&
                            isEdgeRenderingEnabled !== undefined &&
                            setEdgeRenderingEnabled !== undefined && (
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
                {selectedFeedItem && (
                    <SelectedFeedInfo networkConfig={networkConfig} network={network} selectedFeedItem={selectedFeedItem} />
                )}
                <KeyPanel network={network} themeMode={themeMode} />
            </div>
            <div className="padding-t-m padding-b-m padding-r-m padding-l-m">
                <ConfigControls />
            </div>
        </>
    );
};

Wrapper.defaultProps = {
    isEdgeRenderingEnabled: undefined,
    setEdgeRenderingEnabled: undefined,
};
