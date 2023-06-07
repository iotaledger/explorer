import { CONFLICT_REASON_STRINGS, ConflictReason } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import classNames from "classnames";
import React, { useContext, useRef, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import Modal from "../../app/components/Modal";
import BlockTangleState from "../../app/components/stardust/block/BlockTangleState";
import TruncatedId from "../../app/components/stardust/TruncatedId";
import { KeyPanel } from "../../app/components/Visualizer/KeyPanel";
import NetworkContext from "../../app/context/NetworkContext";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ReactComponent as CloseIcon } from "../../assets/close.svg";
import mainHeader from "../../assets/modals/visualizer/main-header.json";
import { DateHelper } from "../../helpers/dateHelper";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { useNetworkStats } from "../../helpers/hooks/useNetworkStats";
import { formatAmount } from "../../helpers/stardust/valueFormatHelper";
import { ReactComponent as DropdownIcon } from "./../../assets/dropdown-arrow.svg";
import { useVisualizerViva } from "./useVisualizerViva";

const VisualizerVivagraph: React.FC<RouteComponentProps<VisualizerRouteProps>> = (
    { match: { params: { network } } }
) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [networkConfig] = useNetworkConfig(network);
    const [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent] = useNetworkStats(network);
    const graphElement = useRef<HTMLDivElement | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

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

    const getStatus = (referenced?: number) => (referenced ? "referenced" : undefined);
    const getConflictReasonMessage = (conflictReason?: ConflictReason) => (
        conflictReason ?
            CONFLICT_REASON_STRINGS[conflictReason] :
            undefined
    );
    const properties = selectedFeedItem?.properties;

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
            {selectedFeedItem && (
                <div className="info-panel card padding-m">
                    <div className="row middle spread">
                        <button type="button" className="icon-button" onClick={() => selectNode()}>
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="col">
                        <div className="card--content">
                            <div className="card--label">Block
                                {selectedFeedItem.payloadType !== "Milestone" &&
                                        selectedFeedItem.metadata && (
                                            <span className="margin-l-t">
                                                <BlockTangleState
                                                    network={network}
                                                    status={getStatus(selectedFeedItem?.metadata?.referenced)}
                                                    hasConflicts={selectedFeedItem.metadata?.conflicting}
                                                    conflictReason={getConflictReasonMessage(
                                                        selectedFeedItem?.metadata?.conflictReason
                                                    )}
                                                />
                                            </span>
                                        )}
                            </div>
                            <div className="card--value overflow-ellipsis">
                                <Link
                                    to={`/${networkConfig.network
                                        }/block/${selectedFeedItem?.blockId}`}
                                    target="_blank"
                                >
                                    <TruncatedId id={selectedFeedItem.blockId} />
                                </Link>
                            </div>
                            {properties?.transactionId && (
                            <React.Fragment>
                                <div className="card--label">Transaction id</div>
                                <div className="card--value">
                                    <Link
                                        to={`/${networkConfig.network
                                                }/transaction/${properties?.transactionId}`}
                                        target="_blank"
                                    >
                                        <TruncatedId id={properties?.transactionId} />
                                    </Link>
                                </div>
                            </React.Fragment>
                                )}
                            {properties?.tag && (
                            <React.Fragment>
                                <div className="card--label">Tag</div>
                                <div className="card--value truncate">
                                    {Converter.hexToUtf8(
                                                properties.tag
                                            )}
                                </div>
                                <div className="card--label">Hex</div>
                                <div className="card--value truncate">
                                    {properties.tag}
                                </div>
                            </React.Fragment>
                                )}
                            {selectedFeedItem.metadata?.milestone !== undefined && (
                            <React.Fragment>
                                {properties?.milestoneId && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Milestone id
                                    </div>
                                    <div className="card--value">
                                        <Link
                                            to={`/${networkConfig.network
                                                        }/block/${selectedFeedItem?.blockId}`}
                                            target="_blank"
                                        >
                                            <TruncatedId id={properties.milestoneId} />
                                        </Link>
                                    </div>
                                </React.Fragment>
                                        )}
                                <div className="card--label">
                                    Milestone index
                                </div>
                                <div className="card--value">
                                    <Link
                                        to={`/${networkConfig.network
                                                }/block/${selectedFeedItem?.blockId}`}
                                        target="_blank"
                                    >
                                        {selectedFeedItem.metadata.milestone}
                                    </Link>
                                </div>
                                {properties?.timestamp && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Timestamp
                                    </div>
                                    <div className="card--value">
                                        {DateHelper.formatShort(
                                                        DateHelper.milliseconds(
                                                            properties.timestamp
                                                        )
                                                    )}
                                    </div>
                                </React.Fragment>
                                        )}
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
                            {selectedFeedItem?.reattachments && selectedFeedItem.reattachments.length > 0 && (
                            <React.Fragment>
                                <div
                                    className="
                                                info-panel__dropdown
                                                card--content__input
                                                card--value"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    <div
                                        className={
                                                    classNames(
                                                        "margin-r-t",
                                                        "card--content__input--dropdown",
                                                        { opened: isExpanded })
                                                }
                                    >
                                        <DropdownIcon />
                                    </div>
                                    <div className="card--label">
                                        Reattachments
                                    </div>
                                </div>
                                <div
                                    className={
                                                classNames(
                                                    "info-panel__reattachments",
                                                    { "info-panel__reattachments--opened": isExpanded })
                                            }
                                >
                                    {selectedFeedItem.reattachments.map((item, index) => (
                                        <div key={index} className="card--value row">
                                            <Link
                                                to={`/${networkConfig.network
                                                        }/block/${item.blockId}`}
                                                className="truncate"
                                                target="_blank"
                                            >
                                                <TruncatedId id={item.blockId} />
                                            </Link>
                                            {item?.metadata && (
                                            <span className="margin-l-t">
                                                <BlockTangleState
                                                    network={network}
                                                    status={getStatus(item.metadata?.referenced)}
                                                    hasConflicts={item.metadata?.conflicting}
                                                    conflictReason={getConflictReasonMessage(
                                                                    item.metadata?.conflictReason
                                                                )}
                                                />
                                            </span>
                                                    )}
                                        </div>
                                            ))}
                                </div>
                            </React.Fragment>
                                )}
                        </div>
                    </div>
                </div>
            )}
            <KeyPanel />
        </div>
);
};
export { VisualizerVivagraph };
export default VisualizerVivagraph;
