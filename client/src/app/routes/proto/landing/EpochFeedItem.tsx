import moment from "moment/moment";
import React from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { useEpoch, useEpochBlocks, useEpochTxs } from "../../../../helpers/proto/useEpoch";
import Spinner from "../../../components/Spinner";
import Tooltip from "../../../components/Tooltip";

interface EpochFeedItemProps {
    index: number;
    latestEpochIndex: number;
    network: string;
    isLatestEpoch: boolean;
}

const EpochFeedItem: React.FC<EpochFeedItemProps> = (
    { network, index, latestEpochIndex, isLatestEpoch }
) => {
    const [epoch] = useEpoch(network, "", index);
    const [epochBlocks] = useEpochBlocks(network, "", index);
    const [epochTxs] = useEpochTxs(network, "", index);

    const secondsSinceLast = useMilestoneInterval(latestEpochIndex);
    const secondsSinceLastView = secondsSinceLast ? (
        <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span>
    ) : "";

    const classes = ["feed-item"];
    if (isLatestEpoch) {
        classes.push("feed-item__latest");
    }

    let epochIdShort;
    let tooltipContent;
    let ago;
    if (epoch) {
        const commitment = epoch.commitment;
        epochIdShort = `${commitment.slice(0, 6)}....${commitment.slice(-6)}`;
        tooltipContent = DateHelper.formatShort(epoch.endTime);
        ago = moment(epoch.endTime).fromNow();
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
                {epoch ?
                    <Link
                        className="feed-item--hash ms-id"
                        to={`/${network}/epoch/${epoch?.commitment}`}
                    >
                        {epochIdShort}
                    </Link> : <Spinner />}
            </div>
            <div className="feed-item__content desktop-only">
                <span className="feed-item--label">Blocks</span>
                <span className="feed-item--value ms-blocks">
                    {epochBlocks ? <span>{epochBlocks.blocks.length}</span> : <Spinner />}
                </span>
            </div>
            <div className="feed-item__content desktop-only">
                <span className="feed-item--label">Txs</span>
                <span className="feed-item--value ms-txs">
                    {epochTxs ? <span>{epochTxs.transactions.length}</span> : <Spinner />}
                </span>
            </div>
            <div className="feed-item__content">
                <span className="feed-item--label">Timestamp</span>
                <span className="feed-item--value ms-timestamp desktop-only">
                    <Tooltip
                        tooltipContent={tooltipContent}
                    >
                        {isLatestEpoch ? secondsSinceLastView : ago}
                    </Tooltip>
                </span>
                <span className="feed-item--value ms-timestamp mobile">
                    {tooltipContent} ({isLatestEpoch ? secondsSinceLastView : ago})
                </span>
            </div>
        </div>
    );
};

export default EpochFeedItem;
