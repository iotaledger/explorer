import { HexHelper } from "@iota/util.js-stardust";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import Tooltip from "../../../components/Tooltip";
import MilestoneFeedAnalyics from "../../../MilestoneFeedAnalytics";
import "./MilestoneFeed.scss";

const FEED_ITEMS_MAX = 10;

interface MilestoneFeedProps {
    networkConfig: INetwork;
    milestones: IFeedItem[];
    latestMilestoneIndex?: number;
}

const MilestoneFeed: React.FC<MilestoneFeedProps> = ({ networkConfig, milestones, latestMilestoneIndex }) => {
    const network = networkConfig.network;
    const secondsSinceLast = useMilestoneInterval(latestMilestoneIndex);
    const secondsSinceLastView = secondsSinceLast ? (
        <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span>
    ) : "";

    const milestonesToRender: IFeedItem[] = [];
    let highestIndex = 0;
    for (const milestone of milestones) {
        const msIndex = milestone.properties?.index as number;
        if (msIndex > highestIndex) {
            highestIndex = msIndex;
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
                    const blockId = HexHelper.addPrefix(milestone.id);
                    const index = milestone.properties?.index as number;
                    const milestoneId = milestone.properties?.milestoneId as string;
                    const milestoneIdShort = `${milestoneId.slice(0, 10)}....${milestoneId.slice(-10)}`;
                    const timestamp = milestone.properties?.timestamp as number * 1000;
                    const ago = moment(timestamp).fromNow();
                    const tooltipContent = DateHelper.formatShort(timestamp);

                    return (
                        <div className="feed-item ms-feed" key={milestone.id}>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Index</span>
                                <span className="feed-item--value ms-index">
                                    <Link
                                        className="feed-item--hash ms-id"
                                        to={`/${network}/block/${blockId}`}
                                    >
                                        {index}
                                    </Link>
                                </span>
                            </div>
                            <div className="feed-item__content desktop-only">
                                <span className="feed-item--label">Milestone id</span>
                                <Link
                                    className="feed-item--hash ms-id"
                                    to={`/${network}/block/${blockId}`}
                                >
                                    {milestoneIdShort}
                                </Link>
                            </div>
                            <MilestoneFeedAnalyics
                                network={network}
                                milestoneIndex={index}
                            />
                            <div className="feed-item__content">
                                <span className="feed-item--label">Timestamp</span>
                                <span className="feed-item--value ms-timestamp desktop-only">
                                    <Tooltip
                                        tooltipContent={tooltipContent}
                                    >
                                        {index === highestIndex ? secondsSinceLastView : ago}
                                    </Tooltip>
                                </span>
                                <span className="feed-item--value ms-timestamp mobile">
                                    {tooltipContent} ({index === highestIndex ? secondsSinceLastView : ago})
                                </span>
                            </div>
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
