import React, { useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import Modal from "../../app/components/Modal";
import { KeyPanel } from "../../app/components/Visualizer/KeyPanel";
import { SelectedFeedInfo } from "../../app/components/Visualizer/SelectedFeedInfo";
import { StatsPanel } from "../../app/components/Visualizer/StatsPanel";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import mainHeader from "../../assets/modals/visualizer/main-header.json";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { useVisualizerViva } from "./useVisualizerViva";

const VisualizerVivagraph: React.FC<RouteComponentProps<VisualizerRouteProps>> = (
    { match: { params: { network } } }
) => {
    const [networkConfig] = useNetworkConfig(network);
    const graphElement = useRef<HTMLDivElement | null>(null);

    const {
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
    } = useVisualizerViva(network, graphElement);

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
};
export { VisualizerVivagraph };
export default VisualizerVivagraph;
