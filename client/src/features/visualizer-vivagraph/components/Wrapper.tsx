import React, { useCallback } from "react";
import Modal from "~/app/components/Modal";
import { TSelectFeedItemNova } from "~/app/types/visualizer.types";
import { INetwork } from "~/models/config/INetwork";
import KeyPanel from "./KeyPanel";
import mainHeader from "~assets/modals/visualizer/main-header.json";
import { SelectedFeedInfo } from "./SelectedFeedInfo";
import { ThemeMode } from "../definitions/enums";

export const Wrapper = ({
    children,
    network,
    networkConfig,
    themeMode,

    isPlaying,

    selectedFeedItem,
}: {
    readonly children: React.ReactNode;
    readonly network: string;
    readonly networkConfig: INetwork;
    readonly themeMode: ThemeMode;
    readonly isPlaying: boolean;
    readonly selectedFeedItem: TSelectFeedItemNova;
}) => {
    const onToggle = useCallback(() => {}, []);

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
                            <input className="input form-input-long" type="text" value={""} onChange={(e) => {}} maxLength={2000} />
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
