import { HexHelper } from "@iota/util.js-stardust";
import React from "react";
import { Link } from "react-router-dom";
import { INetwork } from "../../../../models/config/INetwork";
import { IMilestoneFeedItem } from "../../../../models/IMilestoneFeedItem";
import TruncatedId from "../../../components/stardust/TruncatedId";
import MilestoneFeedAnalyics from "./MilestoneFeedAnalytics";
import "./MilestoneFeed.scss";
import MilestoneFeedTimestamp from "./MilestoneFeedTimestamp";

const FEED_ITEMS_MAX = 10;

interface MilestoneFeedProps {
    networkConfig: INetwork;
    milestones: IMilestoneFeedItem[];
    latestMilestoneIndex?: number;
}

const MilestoneFeed: React.FC<MilestoneFeedProps> = ({ networkConfig, milestones, latestMilestoneIndex }) => {
    const network = networkConfig.network;

    let highestIndex = 0;
    const milestonesToRender: IMilestoneFeedItem[] = [];
    for (const milestone of milestones) {
        if (milestone.index > highestIndex) {
            highestIndex = milestone.index;
        }

        milestonesToRender.push(milestone);
        if (milestonesToRender.length === FEED_ITEMS_MAX) {
            break;
        }
    }

    return (
        <>
            <div className="section--header milestone-feed-header row padding-l-8">
                <h2>Latest milestones</h2>
            </div>
            <div className="feed-items">
                <div className="row feed-item--header ms-feed">
                    <span className="label ms-index">Index</span>
                    <span className="label ms-id">Milestone Id</span>
                    <span className="label ms-blocks">Blocks</span>
                    <span className="label ms-txs">Txs</span>
                    <span className="label ms-timestamp">Timestamp</span>
                </div>
                {milestonesToRender.length === 0 && (
                    <p>There are no milestones in the feed.</p>
                )}
                {milestonesToRender.map(milestone => {
                    const blockId = HexHelper.addPrefix(milestone.blockId);
                    const milestoneId = milestone.milestoneId;
                    const timestamp = milestone.timestamp * 1000;
                    return (
                        <div className="feed-item ms-feed" key={milestoneId}>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Index</span>
                                <span className="feed-item--value ms-index">
                                    <Link
                                        className="feed-item--hash ms-id"
                                        to={`/${network}/block/${blockId}`}
                                    >
                                        {milestone.index}
                                    </Link>
                                </span>
                            </div>
                            <div className="feed-item__content desktop-only">
                                <div className="feed-item--hash ms-id">
                                    <TruncatedId
                                        id={milestoneId}
                                        link={`/${network}/block/${blockId}`}
                                    />
                                </div>
                            </div>
                            <MilestoneFeedAnalyics
                                network={network}
                                milestoneIndex={milestone.index}
                                blockId={blockId}
                            />
                            <MilestoneFeedTimestamp
                                timestamp={timestamp}
                                showMilliseconds={milestone.index === highestIndex}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

MilestoneFeed.defaultProps = {
    latestMilestoneIndex: undefined
};

export default MilestoneFeed;
