/* eslint-disable react/jsx-no-useless-fragment */
import { Converter } from "@iota/util.js-stardust";
import React, { useContext, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { useNetworkConfig } from "../../../helpers/hooks/useNetworkConfig";
import { useNetworkStats } from "../../../helpers/hooks/useNetworkStats";
import { useVisualizerState } from "../../../helpers/hooks/useVisualizerState";
import { RouteBuilder } from "../../../helpers/routeBuilder";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import Modal from "../../components/Modal";
import NetworkContext from "../../context/NetworkContext";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import mainHeader from "./../../../assets/modals/visualizer/main-header.json";
import "./Visualizer.scss";

export const Visualizer: React.FC<RouteComponentProps<VisualizerRouteProps>> = (
    { match: { params: { network } } }
) => {
    const { tokenInfo } = useContext(NetworkContext);
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
        setIsFormatAmountsFull
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
            {selectedFeedItem && (
                <div className="info-panel-container">
                    <div className="card fill padding-m">
                        <div className="row middle spread">
                            <button type="button" className="icon-button" onClick={() => selectNode()}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="col">
                            <div className="card--content">
                                <>
                                    <div className="card--label">Block</div>
                                    <div className="card--value overflow-ellipsis">
                                        <a
                                            className="button"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={
                                                `${window.location.origin}${RouteBuilder
                                                    .buildItem(networkConfig, selectedFeedItem.blockId)}`
                                            }
                                        >
                                            {selectedFeedItem.blockId}
                                        </a>
                                    </div>
                                    {selectedFeedItem?.properties?.Tag &&
                                        selectedFeedItem.metadata?.milestone === undefined && (
                                            <React.Fragment>
                                                <div className="card--label">Tag</div>
                                                <div className="card--value overflow-ellipsis">
                                                    <a
                                                        className="button"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {selectedFeedItem?.properties.Tag as string}
                                                    </a>
                                                </div>
                                            </React.Fragment>
                                        )}
                                    {selectedFeedItem?.properties?.Index && (
                                        <React.Fragment>
                                            <div className="card--label">Tag</div>
                                            <div className="card--value overflow-ellipsis">
                                                <a className="button" target="_blank" rel="noopener noreferrer">
                                                    {Converter.hexToUtf8(
                                                        selectedFeedItem?.properties.Index as string
                                                    )}
                                                </a>
                                            </div>
                                            <div className="card--label">
                                                Index Hex
                                            </div>
                                            <div className="card--value overflow-ellipsis">
                                                <a className="button" target="_blank" rel="noopener noreferrer">
                                                    {selectedFeedItem?.properties.Index as string}
                                                </a>
                                            </div>
                                        </React.Fragment>
                                    )}
                                    {selectedFeedItem.metadata?.milestone !== undefined && (
                                        <React.Fragment>
                                            <div className="card--label">
                                                Milestone
                                            </div>
                                            <div className="card--value">
                                                {selectedFeedItem.metadata.milestone}
                                            </div>
                                        </React.Fragment>
                                    )}
                                    {selectedFeedItem?.value !== undefined &&
                                        selectedFeedItem.metadata?.milestone === undefined && (
                                            <React.Fragment>
                                                <div className="card--label">Value</div>
                                                <div className="card--value">
                                                    <span
                                                        onClick={() => setIsFormatAmountsFull(!isFormatAmountsFull)}
                                                        className="pointer margin-r-5"
                                                    >
                                                        {
                                                            formatAmount(
                                                                selectedFeedItem?.value,
                                                                tokenInfo,
                                                                isFormatAmountsFull ?? undefined
                                                            )
                                                        }
                                                    </span>
                                                </div>
                                            </React.Fragment>
                                        )}
                                </>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="key-panel-container">
                <div className="card key-panel">
                    <div className="key-panel-item">
                        <div className="key-marker vertex-state--pending" />
                        <div className="key-label">Pending</div>
                    </div>
                    <div className="key-panel-item">
                        <div className="key-marker vertex-state--included" />
                        <div className="key-label">Included</div>
                    </div>
                    <div className="key-panel-item">
                        <div className="key-marker vertex-state--referenced" />
                        <div className="key-label">Referenced</div>
                    </div>
                    <div className="key-panel-item">
                        <div className="key-marker vertex-state--conflicting" />
                        <div className="key-label">Conflicting</div>
                    </div>
                    <div className="key-panel-item">
                        <div className="key-marker vertex-state--milestone" />
                        <div className="key-label">Milestone</div>
                    </div>
                    <div className="key-panel-item">
                        <div className="key-marker vertex-state--search-result" />
                        <div className="key-label">Search result</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

