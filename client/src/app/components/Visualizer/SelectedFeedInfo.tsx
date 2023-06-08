import { CONFLICT_REASON_STRINGS, ConflictReason } from "@iota/iota.js-stardust";
import { Converter } from "@iota/util.js-stardust";
import classNames from "classnames";
import React, { useContext, useState } from "react";

import "./KeyPanel.scss";
import { Link } from "react-router-dom";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";

import { DateHelper } from "../../../helpers/dateHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { INetwork } from "../../../models/config/INetwork";
import NetworkContext from "../../context/NetworkContext";
import { TSelectFeedItem, TSelectNode } from "../../types/visualizer.types";
import BlockTangleState from "../stardust/block/BlockTangleState";

import TruncatedId from "../stardust/TruncatedId";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";

export const SelectedFeedInfo = ({
    network,
    selectedFeedItem,
    selectNode,
    networkConfig
}: {
    networkConfig: INetwork;
    network: string;
    selectedFeedItem: TSelectFeedItem;
    selectNode: TSelectNode;
}) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormatAmountsFull, setIsFormatAmountsFull] = useState<boolean | null>(null);
    const getStatus = (referenced?: number) => (referenced ? "referenced" : undefined);

    const getConflictReasonMessage = (conflictReason?: ConflictReason) => (
        conflictReason ? CONFLICT_REASON_STRINGS[conflictReason] : undefined
    );

    const properties = selectedFeedItem?.properties;

    if (!selectedFeedItem) {
        return null;
    }

    return (
        <div className="info-panel card padding-m">
            <div className="row middle spread">
                <button type="button" className="icon-button" onClick={() => selectNode()}>
                    <CloseIcon />
                </button>
            </div>
            <div className="col">
                <div className="card--content">
                    <div className="card--label">Block
                        {selectedFeedItem.payloadType !== "Milestone" && selectedFeedItem.metadata && (
                        <span className="margin-l-t">
                            <BlockTangleState
                                network={network}
                                status={getStatus(selectedFeedItem?.metadata?.referenced)}
                                hasConflicts={selectedFeedItem.metadata?.conflicting}
                                conflictReason={getConflictReasonMessage(selectedFeedItem?.metadata?.conflictReason)}
                            />
                        </span>)}
                    </div>
                    <div className="card--value overflow-ellipsis">
                        <Link
                            to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`}
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
                                to={`/${networkConfig.network}/transaction/${properties?.transactionId}`}
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
                            {Converter.hexToUtf8(properties.tag)}
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
                                            to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`}
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
                                    to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`}
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
                                        {DateHelper.formatShort(DateHelper.milliseconds(properties.timestamp))}
                                    </div>
                                </React.Fragment>
                            )}
                        </React.Fragment>
                    )}
                    {selectedFeedItem?.value !== undefined && selectedFeedItem.metadata?.milestone === undefined && (
                    <React.Fragment>
                        <div className="card--label">Value</div>
                        <div className="card--value">
                            <span
                                onClick={() => setIsFormatAmountsFull(!isFormatAmountsFull)}
                                className="pointer margin-r-5"
                            >
                                {formatAmount(selectedFeedItem?.value, tokenInfo, isFormatAmountsFull ?? undefined)}
                            </span>
                        </div>
                    </React.Fragment>)}
                    {selectedFeedItem?.reattachments && selectedFeedItem.reattachments.length > 0 && (
                    <React.Fragment>
                        <div
                            className="info-panel__dropdown card--content__input card--value"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div
                                className={classNames(
                                "margin-r-t",
                                "card--content__input--dropdown",
                                { opened: isExpanded }
                            )}
                            >
                                <DropdownIcon />
                            </div>
                            <div className="card--label">
                                Reattachments
                            </div>
                        </div>
                        <div
                            className={classNames(
                            "info-panel__reattachments",
                            { "info-panel__reattachments--opened": isExpanded }
                        )}
                        >
                            {selectedFeedItem.reattachments.map((item, index) => (
                                <div key={index} className="card--value row">
                                    <Link
                                        to={`/${networkConfig.network}/block/${item.blockId}`}
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
                                            conflictReason={getConflictReasonMessage(item.metadata?.conflictReason)}
                                        />
                                    </span>
                                )}
                                </div>))}
                        </div>
                    </React.Fragment>
                )}
                </div>
            </div>
        </div>
    );
};
