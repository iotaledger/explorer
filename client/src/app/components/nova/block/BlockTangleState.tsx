import classNames from "classnames";
import React from "react";
import Tooltip from "../../Tooltip";
import { BlockState, u64 } from "@iota/sdk-wasm-nova/web";
import { BlockFailureReason, BLOCK_FAILURE_REASON_STRINGS } from "@iota/sdk-wasm-nova/web/lib/types/models/block-failure-reason";
import moment from "moment";
import "./BlockTangleState.scss";

export interface BlockTangleStateProps {
    /**
     * The Block status.
     */
    status: BlockState;

    /**
     * The issuing time.
     */
    issuingTime: u64;

    /**
     * The failure reason.
     */
    failureReason?: BlockFailureReason;
}

const BlockTangleState: React.FC<BlockTangleStateProps> = ({ status, issuingTime, failureReason }) => {
    const blockIssueMoment = moment(Number(issuingTime) / 1000000);
    const timeReference = blockIssueMoment.fromNow();
    const longTimestamp = blockIssueMoment.format("LLLL");

    return (
        <>
            <div className="blocks-tangle-state">
                {status && (
                    <React.Fragment>
                        <div
                            className={classNames(
                                "block-tangle-state",
                                {
                                    "block-tangle-state__confirmed": status === "confirmed" || "finalized",
                                },
                                {
                                    "block-tangle-state__conflicting": status === "rejected" && "failed",
                                },
                                { "block-tangle-state__pending": status === "pending" },
                            )}
                        >
                            {failureReason ? (
                                <Tooltip tooltipContent={BLOCK_FAILURE_REASON_STRINGS[failureReason]}>
                                    <span className="capitalize-text" style={{ color: "#ca493d" }}>
                                        {status}
                                    </span>
                                </Tooltip>
                            ) : (
                                <span className="capitalize-text">{status}</span>
                            )}
                        </div>
                        <div className="block-tangle-reference">
                            <span title={longTimestamp} className="time-reference">
                                {timeReference}
                            </span>
                        </div>
                    </React.Fragment>
                )}
            </div>
        </>
    );
};

export default BlockTangleState;
