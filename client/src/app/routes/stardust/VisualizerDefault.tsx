import React, { useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useNetworkConfig } from "../../../helpers/hooks/useNetworkConfig";
import { useNetworkStats } from "../../../helpers/hooks/useNetworkStats";
import { useVisualizerState } from "../../../helpers/hooks/useVisualizerState";
import Modal from "../../components/Modal";
import { KeyPanel } from "../../components/Visualizer/KeyPanel";
import { SelectedFeedInfo } from "../../components/Visualizer/SelectedFeedInfo";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import mainHeader from "./../../../assets/modals/visualizer/main-header.json";
import "./Visualizer.scss";

export const VisualizerDefault: React.FC<RouteComponentProps<VisualizerRouteProps>> = (
    { match: { params: { network } } }
) => {
    const [networkConfig] = useNetworkConfig(network);
    const [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent] = useNetworkStats(network);
    const graphElement = useRef<HTMLDivElement | null>(null);

    const [
        toggleActivity,
        selectNode,
        filter,
        setFilter,
        isActive,
        blocksCount,
        selectedFeedItem,
        isFormatAmountsFull,
        setIsFormatAmountsFull,
        lastClick
    ] = useVisualizerState(network, graphElement);


    return (
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
                            onChange={e => setFilter(e.target.value)}
                            maxLength={2000}
                        />
                    </div>
                </div>
            </div>
            <div className="graph-border">
                <div
                    className="viva"
                    onClick={() => {
                        if (lastClick && Date.now() - lastClick > 300) {
                            selectNode();
                        }
                    }}
                    ref={graphElement}
                />
                <div className="action-panel-container">
                    <div className="card">
                        <button className="pause-button" type="button" onClick={() => toggleActivity()}>
                            {isActive
                                ? <span className="material-icons">pause</span>
                                : <span className="material-icons">play_arrow</span>}
                        </button>
                    </div>
                </div>
            </div>
            <div className="stats-panel-container">
                <div className="card stats-panel">
                    <div className="card--content">
                        <div className="stats-panel__info">
                            <div className="card--label">Blocks</div>
                            <div className="card--value">
                                {blocksCount}
                            </div>
                        </div>
                        <div className="stats-panel__info">
                            <div className="card--label">BPS / CBPS</div>
                            <div className="card--value">
                                {blocksPerSecond} / {confirmedBlocksPerSecond}
                            </div>
                        </div>
                        <div className="stats-panel__info">
                            <div className="card--label">Referenced Rate</div>
                            <div className="card--value">
                                {confirmedBlocksPerSecondPercent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SelectedFeedInfo
                networkConfig={networkConfig}
                network={network}
                selectedFeedItem={selectedFeedItem}
                selectNode={selectNode}
            />
            <KeyPanel />
        </div>
    );
};

