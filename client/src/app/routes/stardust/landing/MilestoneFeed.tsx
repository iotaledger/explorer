import React from "react";
import { Link } from "react-router-dom";
import MilestoneFeedAnalyics from "./MilestoneFeedAnalytics";
import { DateHelper } from "~helpers/dateHelper";
import { useMilestoneInterval } from "~helpers/stardust/hooks/useMilestoneInterval";
import { HexHelper } from "~helpers/stardust/hexHelper";
import { INetwork } from "~models/config/INetwork";
import { IMilestoneFeedItem } from "~models/IMilestoneFeedItem";
import TruncatedId from "../../../components/stardust/TruncatedId";
import "./MilestoneFeed.scss";

const FEED_ITEMS_MAX = 10;

interface MilestoneFeedProps {
    readonly networkConfig: INetwork;
    readonly milestones: IMilestoneFeedItem[];
    readonly latestMilestoneIndex?: number;
}

const MilestoneFeed: React.FC<MilestoneFeedProps> = ({ networkConfig, milestones, latestMilestoneIndex }) => {
    const network = networkConfig.network;
    const secondsSinceLast = useMilestoneInterval(latestMilestoneIndex);
    const secondsSinceLastView = secondsSinceLast ? <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span> : "";

    let highestIndex = 0;
    const milestonesToRender: IMilestoneFeedItem[] = [];
    for (const milestone of milestones) {
        if (!milestonesToRender.some((ms) => ms.index === milestone.index)) {
            if (milestone.index > highestIndex) {
                highestIndex = milestone.index;
            }

            milestonesToRender.push(milestone);

            if (milestonesToRender.length === FEED_ITEMS_MAX) {
                break;
            }
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
                {milestonesToRender.length === 0 && <p>There are no milestones in the feed.</p>}
                {milestonesToRender.map((milestone) => {
                    const blockId = HexHelper.addPrefix(milestone.blockId);
                    const milestoneId = milestone.milestoneId;
                    const timestamp = milestone.timestamp * 1000;
                    const date = DateHelper.formatShort(timestamp);

                    return (
                        <div className="feed-item ms-feed" key={milestoneId}>
                            <div className="feed-item__content">
                                <span className="feed-item--label">Index</span>
                                <span className="feed-item--value ms-index">
                                    <Link className="feed-item--hash ms-id" to={`/${network}/block/${blockId}`}>
                                        {milestone.index}
                                    </Link>
                                </span>
                            </div>
                            <div className="feed-item__content desktop-only">
                                <div className="feed-item--hash ms-id">
                                    <TruncatedId id={milestoneId} link={`/${network}/block/${blockId}`} />
                                </div>
                            </div>
                            <MilestoneFeedAnalyics network={network} milestoneIndex={milestone.index} blockId={blockId} />
                            <div className="feed-item__content">
                                <span className="feed-item--label">Timestamp</span>
                                <span className="feed-item--value ms-timestamp">
                                    {milestone.index === highestIndex ? secondsSinceLastView : date}
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
    latestMilestoneIndex: undefined,
};

export default MilestoneFeed;
