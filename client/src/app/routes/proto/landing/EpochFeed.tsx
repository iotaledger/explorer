import { HexHelper } from "@iota/util.js-stardust";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import Tooltip from "../../../components/Tooltip";
import "./EpochFeed.scss";

// const FEED_ITEMS_MAX = 10;

interface EpochFeedProps {
    networkConfig: INetwork;
    epochs: IFeedItem[];
    latestEpochIndex?: number;
}

const EpochFeed: React.FC<EpochFeedProps> = ({ networkConfig, epochs, latestEpochIndex }) => {
    const network = networkConfig.network;
    const secondsSinceLast = useMilestoneInterval(latestEpochIndex);
    const secondsSinceLastView = secondsSinceLast ? (

        <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span>
    ) : "";

    let highestEpochIndex = 0;
    for (const epoch of epochs) {
        const index = epoch.properties?.index as number;
        if (index > highestEpochIndex) {
            highestEpochIndex = index;
        }
    }

    return (
        <>
            <div className="section--header milestone-feed-header row padding-l-8">
                <h2>Latest epochs</h2>
            </div>
            <div className="feed-items">
                <div className="row feed-item--header ms-feed">
                    <span className="label ms-index">Index</span>
                    <span className="label ms-id">ID</span>
                    <span className="label ms-blocks">Blocks</span>
                    <span className="label ms-txs">Txs</span>
                    <span className="label ms-timestamp">Timestamp</span>
                </div>
                {epochs.length === 0 && (<p>There are no epochs in the feed.</p>)}
                {epochs.map(epoch => {
                    const epochId = HexHelper.addPrefix(epoch.id);
                    const index = epoch.properties?.index as number;
                    const epochIdShort = `${epochId.slice(0, 6)}....${epochId.slice(-6)}`;
                    const timestamp = epoch.properties?.timestamp as number * 1000;
                    const includedBlocks = epoch.properties?.blocksCount as number ?? 0;
                    const txs = epoch.properties?.txPayloadCount as number ?? 0;
                    const ago = moment(timestamp).fromNow();
                    const tooltipContent = DateHelper.formatShort(timestamp);

                    return (
                        <div className="feed-item ms-feed" key={epoch.id}>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Index</span>
                                <span className="feed-item--value ms-index">
                                    {index}
                                </span>
                            </div>
                            <div className="feed-item__content desktop-only">
                                <span className="feed-item--label">Milestone id</span>
                                <Link
                                    className="feed-item--hash ms-id"
                                    to={`/${network}/epoch/${epochId}`}
                                >
                                    {epochIdShort}
                                </Link>
                            </div>
                            <div className="feed-item__content desktop-only">
                                <span className="feed-item--label">Blocks</span>
                                <span className="feed-item--value ms-blocks">
                                    {includedBlocks}
                                </span>
                            </div>
                            <div className="feed-item__content desktop-only">
                                <span className="feed-item--label">Txs</span>
                                <span className="feed-item--value ms-txs">
                                    {txs}
                                </span>
                            </div>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Timestamp</span>
                                <span className="feed-item--value ms-timestamp desktop-only">
                                    <Tooltip
                                        tooltipContent={tooltipContent}
                                    >
                                        {index === highestEpochIndex ? secondsSinceLastView : ago}
                                    </Tooltip>
                                </span>
                                <span className="feed-item--value ms-timestamp mobile">
                                    {tooltipContent} ({index === highestEpochIndex ? secondsSinceLastView : ago})
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

EpochFeed.defaultProps = {
    latestEpochIndex: undefined
};

export default EpochFeed;
