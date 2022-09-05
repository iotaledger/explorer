import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { RouteBuilder } from "../../../../helpers/routeBuilder";
import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import Tooltip from "../../../components/Tooltip";
import "./MilestoneFeed.scss";

interface MilestoneFeedProps {
    networkConfig: INetwork;
    milestones: IFeedItem[];
    latestMilestoneIndex?: number;
}

const MilestoneFeed: React.FC<MilestoneFeedProps> = ({ networkConfig, milestones, latestMilestoneIndex }) => {
    const network = networkConfig.network;
    const secondsSinceLast = useMilestoneInterval(latestMilestoneIndex);
    const secondsSinceLastView = secondsSinceLast ? ` (last: ${secondsSinceLast.toFixed(2)} s)` : "";

    return (
        <>
            <div className="section--header row space-between padding-l-8">
                <h2>Latest milestones{secondsSinceLastView}</h2>
            </div>
            <div className="feed-items">
                <div className="row feed-item--header ms-feed">
                    <span className="label ms-index">Index</span>
                    <span className="label ms-id">Milestone Id</span>
                    <span className="label ms-blocks">Blocks</span>
                    <span className="label ms-txs">Txs</span>
                    <span className="label ms-timestamp">Timestamp</span>
                </div>
                {milestones.map(milestone => {
                    const index = milestone.properties?.index as number;
                    const milestoneId = milestone.properties?.milestoneId as string;
                    const milestoneIdShort = `${milestoneId.slice(0, 6)}....${milestoneId.slice(-6)}`;
                    const timestamp = milestone.properties?.timestamp as number * 1000;
                    const includedBlocks = 5;
                    const txs = 2;
                    const ago = moment(timestamp).fromNow();
                    const tooltipContent = DateHelper.formatShort(timestamp);

                    return (
                        <div className="feed-item ms-feed" key={milestone.id}>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Index</span>
                                <span className="feed-item--value ms-index">
                                    <Link
                                        className="feed-item--hash ms-id"
                                        to={`${network}/search/${index}`}
                                    >
                                        {index}
                                    </Link>
                                </span>
                            </div>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Milestone id</span>
                                <Link
                                    className="feed-item--hash ms-id"
                                    to={RouteBuilder.buildItem(networkConfig, milestoneId)}
                                >
                                    {milestoneIdShort}
                                </Link>
                            </div>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Blocks</span>
                                <span className="feed-item--value ms-blocks">
                                    {includedBlocks}
                                </span>
                            </div>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Txs</span>
                                <span className="feed-item--value ms-txs">
                                    {txs}
                                </span>
                            </div>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Timestamp</span>
                                <span className="feed-item--value ms-timestamp">
                                    <Tooltip
                                        tooltipContent={tooltipContent}
                                    >
                                        {ago}
                                    </Tooltip>
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
