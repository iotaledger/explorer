import classNames from "classnames";
import React, { useEffect, useState } from "react";
import Tooltip from "../../Tooltip";
import { BlockState, u64 } from "@iota/sdk-wasm-nova/web";
import { BlockFailureReason } from "@iota/sdk-wasm-nova/web/lib/types/models/block-failure-reason";
import "./BlockTangleState.scss";
import { DateHelper } from "~/helpers/dateHelper";

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
    const [readableTimestamp, setReadableTimestamp] = useState<string | undefined>();

    useEffect(() => {
        const timestamp = DateHelper.format(DateHelper.milliseconds(Number(issuingTime) / 1000000));
        setReadableTimestamp(timestamp);
    }, [issuingTime]);

    return (
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
                            // todo: add BLOCK_FAILURE_REASON_STRINGS[failureReason] as tooltip content instead of failureReason?.toString()(track: https://github.com/iotaledger/iota-sdk/issues/1846)
                            <Tooltip tooltipContent={failureReason?.toString()}>
                                <span className="capitalize-text" style={{ color: "#ca493d" }}>
                                    {status}
                                </span>
                            </Tooltip>
                        ) : (
                            <span className="capitalize-text">{status}</span>
                        )}
                    </div>
                    <div className="block-tangle-reference">
                        <span> {readableTimestamp}</span>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

export default BlockTangleState;
