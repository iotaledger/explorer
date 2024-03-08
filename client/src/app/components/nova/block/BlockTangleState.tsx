import { BlockState, u64 } from "@iota/sdk-wasm-nova/web";
import moment from "moment";
import React from "react";
import StatusPill from "~/app/components/nova/StatusPill";
import { PillStatus } from "~/app/lib/ui/enums";
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
}

const BLOCK_STATE_TO_PILL_STATUS: Record<BlockState, PillStatus> = {
    pending: PillStatus.Pending,
    accepted: PillStatus.Success,
    confirmed: PillStatus.Success,
    finalized: PillStatus.Success,
    dropped: PillStatus.Error,
    orphaned: PillStatus.Error,
};

const BlockTangleState: React.FC<BlockTangleStateProps> = ({ status, issuingTime }) => {
    const blockIssueMoment = moment(Number(issuingTime) / 1000000);
    const timeReference = blockIssueMoment.fromNow();
    const longTimestamp = blockIssueMoment.format("LLLL");

    const pillStatus: PillStatus = BLOCK_STATE_TO_PILL_STATUS[status];

    return (
        <>
            <div className="blocks-tangle-state">
                {status && (
                    <React.Fragment>
                        <StatusPill status={pillStatus} label={status} />
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
