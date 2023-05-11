import React from "react";
import { Link } from "react-router-dom";
import { useSlot, useSlotBlocks, useSlotTxs } from "../../../../helpers/proto/useSlot";
import Spinner from "../../../components/Spinner";

interface SlotFeedItemProps {
    index: number;
    network: string;
    isLatestSlot: boolean;
}

const SlotFeedItem: React.FC<SlotFeedItemProps> = (
    { network, index, isLatestSlot }
) => {
    const [slot] = useSlot(network, "", index);
    const [slotBlocks] = useSlotBlocks(network, "", index);
    const [slotTxs] = useSlotTxs(network, "", index);

    const classes = ["feed-item"];
    if (isLatestSlot) {
        classes.push("feed-item__latest");
    }

    let slotIdShort;
    if (slot) {
        const slotId = slot.id;
        slotIdShort = `${slotId.slice(0, 6)}....${slotId.slice(-6)}`;
    }

    return (
        <div className={classes.join(" ")}>
            <div className="feed-item__content">
                <span className="feed-item--label">Index</span>
                <span className="feed-item--value ms-index">
                    {index}
                </span>
            </div>
            <div className="feed-item__content desktop-only">
                <span className="feed-item--label">Commitment</span>
                {slot ?
                    <Link
                        className="feed-item--hash ms-id"
                        to={`/${network}/slot/${slot?.id}`}
                    >
                        {slotIdShort}
                    </Link> : <Spinner compact />}
            </div>
            <div className="feed-item__content desktop-only">
                <span className="feed-item--label">Blocks</span>
                <span className="feed-item--value ms-blocks">
                    {slotBlocks ? <span>{slotBlocks.blocks.length}</span> : <Spinner compact />}
                </span>
            </div>
            <div className="feed-item__content desktop-only">
                <span className="feed-item--label">Txs</span>
                <span className="feed-item--value ms-txs">
                    {slotTxs ? <span>{slotTxs.transactions.length}</span> : <Spinner compact />}
                </span>
            </div>
            {/*
                <div className="feed-item__content">
                <span className="feed-item--label">Timestamp</span>
                <span className="feed-item--value ms-timestamp desktop-only">
                {secondsSinceLastView}
                </span>
                <span className="feed-item--value ms-timestamp mobile">
                {secondsSinceLastView}
                </span>
                </div>
            */}
        </div>
    );
};

export default SlotFeedItem;

