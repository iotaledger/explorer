import { CONFLICT_REASON_STRINGS, ConflictReason, hexToUtf8 } from "@iota/sdk-wasm/web";
import classNames from "classnames";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import BlockTangleState from "~/app/components/stardust/block/BlockTangleState";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import NetworkContext from "~/app/context/NetworkContext";
import { TSelectNode } from "~/app/types/visualizer.types";
import CloseIcon from "~assets/close.svg?react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { DateHelper } from "~helpers/dateHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { useTangleStore } from "../store";
import { INetwork } from "~models/config/INetwork";
import "./KeyPanel.scss";

export const SelectedFeedInfo = ({
    network,
    selectNode,
    networkConfig,
}: {
    readonly networkConfig: INetwork;
    readonly network: string;
    readonly selectNode: TSelectNode;
}) => {
    const clickedInstanceId = useTangleStore((state) => state.clickedInstanceId);
    const setClickedInstanceId = useTangleStore((state) => state.setClickedInstanceId);
    const blockMetadata = useTangleStore((state) => state.blockMetadata);

    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormatAmountsFull, setIsFormatAmountsFull] = useState<boolean | null>(null);
    const getStatus = (referenced?: number) => (referenced ? "referenced" : undefined);

    const getConflictReasonMessage = (conflictReason?: ConflictReason) =>
        conflictReason ? CONFLICT_REASON_STRINGS[conflictReason] : undefined;

    // eslint-disable-next-line no-extra-boolean-cast
    const selectedFeedItem = !!clickedInstanceId ? blockMetadata?.get(clickedInstanceId) : undefined;
    const properties = selectedFeedItem?.properties;

    if (!selectedFeedItem) {
        return null;
    }

    return (
        <div className="info-panel card padding-m">
            <div className="row middle spread">
                <button type="button" className="icon-button" onClick={() => setClickedInstanceId(null)}>
                    <CloseIcon />
                </button>
            </div>
            <div className="col">
                <div className="card--content">
                    <div className="card--label">
                        Block
                        {selectedFeedItem.payloadType !== "Milestone" && selectedFeedItem.metadata && (
                            <span className="margin-l-t">
                                <BlockTangleState
                                    network={network}
                                    status={getStatus(selectedFeedItem?.metadata?.referenced)}
                                    hasConflicts={selectedFeedItem.metadata?.conflicting}
                                    conflictReason={getConflictReasonMessage(selectedFeedItem?.metadata?.conflictReason)}
                                />
                            </span>
                        )}
                    </div>
                    <div className="card--value overflow-ellipsis">
                        <Link to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`} target="_blank">
                            <TruncatedId id={selectedFeedItem.blockId} />
                        </Link>
                    </div>
                    {properties?.transactionId && (
                        <React.Fragment>
                            <div className="card--label">Transaction id</div>
                            <div className="card--value">
                                <Link to={`/${networkConfig.network}/transaction/${properties?.transactionId}`} target="_blank">
                                    <TruncatedId id={properties?.transactionId} />
                                </Link>
                            </div>
                        </React.Fragment>
                    )}
                    {properties?.tag && (
                        <React.Fragment>
                            <div className="card--label">Tag</div>
                            <div className="card--value truncate">{hexToUtf8(properties.tag)}</div>
                            <div className="card--label">Hex</div>
                            <div className="card--value truncate">{properties.tag}</div>
                        </React.Fragment>
                    )}
                    {selectedFeedItem.metadata?.milestone !== undefined && (
                        <React.Fragment>
                            {properties?.milestoneId && (
                                <React.Fragment>
                                    <div className="card--label">Milestone id</div>
                                    <div className="card--value">
                                        <Link to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`} target="_blank">
                                            <TruncatedId id={properties.milestoneId} />
                                        </Link>
                                    </div>
                                </React.Fragment>
                            )}
                            <div className="card--label">Milestone index</div>
                            <div className="card--value">
                                <Link to={`/${networkConfig.network}/block/${selectedFeedItem?.blockId}`} target="_blank">
                                    {selectedFeedItem.metadata.milestone}
                                </Link>
                            </div>
                            {properties?.timestamp && (
                                <React.Fragment>
                                    <div className="card--label">Timestamp</div>
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
                                <span onClick={() => setIsFormatAmountsFull(!isFormatAmountsFull)} className="pointer margin-r-5">
                                    {formatAmount(selectedFeedItem?.value, tokenInfo, isFormatAmountsFull ?? undefined)}
                                </span>
                            </div>
                        </React.Fragment>
                    )}
                    {selectedFeedItem?.reattachments && selectedFeedItem.reattachments.length > 0 && (
                        <React.Fragment>
                            <div
                                className="info-panel__dropdown card--content__input card--value"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <div className={classNames("margin-r-t", "card--content__input--dropdown", { opened: isExpanded })}>
                                    <DropdownIcon />
                                </div>
                                <div className="card--label">Reattachments</div>
                            </div>
                            <div className={classNames("info-panel__reattachments", { "info-panel__reattachments--opened": isExpanded })}>
                                {selectedFeedItem.reattachments.map((item, index) => (
                                    <div key={index} className="card--value row">
                                        <Link to={`/${networkConfig.network}/block/${item.blockId}`} className="truncate" target="_blank">
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
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        </div>
    );
};
