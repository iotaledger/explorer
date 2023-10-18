import React from "react";
import mainHeader from "../../../../assets/modals/visualizer/main-header.json";
import { INetwork } from "../../../../models/config/INetwork";
import { TSelectFeedItem, TSelectNode } from "../../../types/visualizer.types";
import Modal from "../../Modal";
import { KeyPanel } from "./KeyPanel";
import { SelectedFeedInfo } from "./SelectedFeedInfo";
import { StatsPanel } from "./StatsPanel";

export const Wrapper = ({
    blocksCount,
    children,
    filter,
    isPlaying,
    network,
    networkConfig,
    onChangeFilter,
    selectNode,
    selectedFeedItem,
    setIsPlaying
}: {
    blocksCount: number;
    children: React.ReactNode; filter: string;
    isPlaying: boolean;
    network: string;
    networkConfig: INetwork;
    onChangeFilter: React.ChangeEventHandler<HTMLInputElement>;
    selectNode: TSelectNode;
    selectedFeedItem: TSelectFeedItem;
    setIsPlaying: (isPlaying: boolean) => void;
}) => (
    <div className="visualizer-stardust">
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
                        value={filter}
                        onChange={onChangeFilter}
                        maxLength={2000}
                    />
                </div>
            </div>
        </div>
        <div className="graph-border">
            {children}
            <div className="action-panel-container">
                <div className="card">
                    <button className="pause-button" type="button" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying
                                ? <span className="material-icons">pause</span>
                                : <span className="material-icons">play_arrow</span>}
                    </button>
                </div>
            </div>
        </div>
        <StatsPanel blocksCount={blocksCount} network={network} />
        <SelectedFeedInfo
            networkConfig={networkConfig}
            network={network}
            selectedFeedItem={selectedFeedItem}
            selectNode={selectNode}
        />
        <KeyPanel />
    </div>
    );
