import { HexHelper } from "@iota/util.js-stardust";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { INetwork } from "../../../../models/config/INetwork";
import { IMilestoneFeedItem } from "../../../../models/IMilestoneFeedItem";
import Tooltip from "../../../components/Tooltip";
import MilestoneFeedAnalyics from "../../../MilestoneFeedAnalytics";
import "./MilestoneFeed.scss";

const FEED_ITEMS_MAX = 10;

interface MilestoneFeedProps {
    networkConfig: INetwork;
    milestones: IMilestoneFeedItem[];
    latestMilestoneIndex?: number;
}

const MilestoneFeed: React.FC<MilestoneFeedProps> = ({ networkConfig, milestones, latestMilestoneIndex }) => {
    const network = networkConfig.network;
    const secondsSinceLast = useMilestoneInterval(latestMilestoneIndex);
    const secondsSinceLastView = secondsSinceLast ? (
        <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span>
    ) : "";

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
                    const milestoneIdShort = `${milestoneId.slice(0, 10)}....${milestoneId.slice(-10)}`;
                    const timestamp = milestone.timestamp * 1000;
                    const ago = moment(timestamp).fromNow();
                    const tooltipContent = DateHelper.formatShort(timestamp);

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
                                milestoneIndex={milestone.index}
                            />
                            <div className="feed-item__content">
                                <span className="feed-item--label">Timestamp</span>
                                <span className="feed-item--value ms-timestamp desktop-only">
                                    <Tooltip
                                        tooltipContent={tooltipContent}
                                    >
                                        {milestone.index === highestIndex ? secondsSinceLastView : ago}
                                    </Tooltip>
                                </span>
                                <span className="feed-item--value ms-timestamp mobile">
                                    {tooltipContent} ({milestone.index === highestIndex ? secondsSinceLastView : ago})
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
