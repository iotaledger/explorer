import React, { useCallback } from "react";
import Modal from "~/app/components/Modal";
import { TSelectFeedItemNova, TSelectNode } from "~/app/types/visualizer.types";
import { INetwork } from "~/models/config/INetwork";
import KeyPanel from "./KeyPanel";
import mainHeader from "~assets/modals/visualizer/main-header.json";
import { SelectedFeedInfo } from "./SelectedFeedInfo";
import { features } from "~features/visualizer-threejs/constants";
import { ThemeMode } from "../definitions/enums";

export const Wrapper = ({
    blocksCount,
    children,
    isEdgeRenderingEnabled,
    isPlaying,
    network,
    networkConfig,
    onChangeSearch,
    searchValue,
    selectedFeedItem,
    setEdgeRenderingEnabled,
    setIsPlaying,
    themeMode,
}: {
    readonly blocksCount: number;
    readonly children: React.ReactNode;
    readonly network: string;
    readonly networkConfig: INetwork;
    readonly selectNode: TSelectNode;
    readonly selectedFeedItem: TSelectFeedItemNova;
    readonly themeMode: ThemeMode;

    readonly searchValue: string;
    readonly onChangeSearch: (value: string) => void;

    readonly isEdgeRenderingEnabled?: boolean;
    readonly setEdgeRenderingEnabled?: (isEnabled: boolean) => void;

    readonly isPlaying: boolean;
    readonly setIsPlaying: (isPlaying: boolean) => void;
}) => {

    const onToggle = useCallback(() => {
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

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
                                value={searchValue}
                                onChange={(e) => {
                                    onChangeSearch(e.target.value);
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
        </>
    );
};

Wrapper.defaultProps = {
    isEdgeRenderingEnabled: undefined,
    setEdgeRenderingEnabled: undefined,
};
