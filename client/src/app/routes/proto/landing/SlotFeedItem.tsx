import React from "react";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { useSlotBlocks, useSlotTxs } from "../../../../helpers/proto/useSlot";
import Spinner from "../../../components/Spinner";

interface SlotFeedItemProps {
    index: number;
    latestSlotIndex: number;
    network: string;
    isLatestSlot: boolean;
}

const SlotFeedItem: React.FC<SlotFeedItemProps> = (
    { network, index, latestSlotIndex, isLatestSlot }
) => {
    const [slotBlocks] = useSlotBlocks(network, "", index);
    const [slotTxs] = useSlotTxs(network, "", index);

    const secondsSinceLast = useMilestoneInterval(latestSlotIndex);
    const secondsSinceLastView = secondsSinceLast ? (
        <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span>
    ) : "";

    const classes = ["feed-item"];
    if (isLatestSlot) {
        classes.push("feed-item__latest");
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
                <span className="feed-item--label">Blocks</span>
                <span className="feed-item--value ms-blocks">
                    {slotBlocks ? <span>{slotBlocks.blocks.length}</span> : <Spinner />}
                </span>
            </div>
            <div className="feed-item__content desktop-only">
                <span className="feed-item--label">Txs</span>
                <span className="feed-item--value ms-txs">
                    {slotTxs ? <span>{slotTxs.transactions.length}</span> : <Spinner />}
                </span>
            </div>
            <div className="feed-item__content">
                <span className="feed-item--label">Timestamp</span>
                <span className="feed-item--value ms-timestamp desktop-only">
                    {secondsSinceLastView}
                </span>
                <span className="feed-item--value ms-timestamp mobile">
                    {secondsSinceLastView}
                </span>
            </div>
        </div>
    );
};

export default SlotFeedItem;

