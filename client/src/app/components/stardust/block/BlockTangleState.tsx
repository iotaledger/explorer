import classNames from "classnames";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { BlockTangleStateProps } from "./BlockTangleStateProps";
import { useMilestoneDetails } from "~helpers/stardust/hooks/useMilestoneDetails";
import Tooltip from "../../Tooltip";
import "./BlockTangleState.scss";

const BlockTangleState: React.FC<BlockTangleStateProps> = ({ network, status, milestoneIndex, hasConflicts, conflictReason, onClick }) => {
    const [ago, setAgo] = useState<string | undefined>();
    const [blockId, setBlockId] = useState<string | undefined>();
    const [milestoneDetails] = useMilestoneDetails(network, milestoneIndex ?? null);

    useEffect(() => {
        if (milestoneDetails?.milestone?.timestamp) {
            setAgo(moment(milestoneDetails.milestone?.timestamp * 1000).fromNow());
        }
        setBlockId(milestoneDetails?.blockId);
    }, [milestoneDetails]);

    return (
        <div className="blocks-tangle-state">
            {status === "milestone" && (
                <div className="block-tangle-reference">
                    <div className="row">
                        <div
                            className={classNames(
                                "block-tangle-state",
                                { "block-tangle-state__no-click": !onClick },
                                { "block-tangle-state__confirmed": milestoneIndex },
                                { "block-tangle-state__pending": !milestoneIndex },
                            )}
                        >
                            {milestoneIndex && "Confirmed"}
                            {!milestoneIndex && "Pending"}
                        </div>
                        {milestoneIndex && <span className="row middle">Created {ago}</span>}
                    </div>
                </div>
            )}

            {status !== "milestone" && (
                <React.Fragment>
                    <div
                        className={classNames(
                            "block-tangle-state",
                            { "block-tangle-state__no-click": !onClick },
                            {
                                "block-tangle-state__confirmed": status === "referenced" && !hasConflicts,
                            },
                            {
                                "block-tangle-state__conflicting": status === "referenced" && hasConflicts,
                            },
                            { "block-tangle-state__pending": status === "pending" },
                            { "block-tangle-state__unknown": status === "unknown" },
                        )}
                    >
                        {status === "unknown" && "Unknown"}
                        {status === "referenced" && !hasConflicts && "Confirmed"}
                        {status === "pending" && "Pending"}
                        {hasConflicts && (
                            <Tooltip tooltipContent={conflictReason}>
                                <span style={{ color: "#ca493d" }}>Conflicting</span>
                            </Tooltip>
                        )}
                    </div>
                    {status === "referenced" && milestoneIndex !== undefined && milestoneIndex > 1 ? (
                        <div className="block-tangle-reference">
                            <span>Referenced by </span>
                            <span
                                className="block-tangle-reference__link"
                                onClick={() => {
                                    if (onClick) {
                                        onClick(blockId);
                                    }
                                }}
                            >
                                Milestone {milestoneIndex}
                            </span>
                            <span> {ago}</span>
                        </div>
                    ) : (
                        ""
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

export default BlockTangleState;
