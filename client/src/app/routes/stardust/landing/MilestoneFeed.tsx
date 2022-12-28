import { HexHelper } from "@iota/util.js-stardust";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { DateHelper } from "../../../../helpers/dateHelper";
import { useMilestoneInterval } from "../../../../helpers/hooks/useMilestoneInterval";
import { IMilestoneAnalyticStats } from "../../../../models/api/stats/IMilestoneAnalyticStats";
import { INetwork } from "../../../../models/config/INetwork";
import { STARDUST } from "../../../../models/config/protocolVersion";
import { IMilestoneFeedItem } from "../../../../models/IMilestoneFeedItem";
import { StardustTangleCacheService } from "../../../../services/stardust/stardustTangleCacheService";
import Tooltip from "../../../components/Tooltip";
import "./MilestoneFeed.scss";

const FEED_ITEMS_MAX = 10;

interface MilestoneFeedProps {
    networkConfig: INetwork;
    milestones: IMilestoneFeedItem[];
    latestMilestoneIndex?: number;
}

const MilestoneFeed: React.FC<MilestoneFeedProps> = ({ networkConfig, milestones, latestMilestoneIndex }) => {
    const [milestoneIdToStats, setMilestoneIdToStats] = useState<Map<string, IMilestoneAnalyticStats>>(new Map());

    const network = networkConfig.network;
    const secondsSinceLast = useMilestoneInterval(latestMilestoneIndex);
    const secondsSinceLastView = secondsSinceLast ? (
        <span className="seconds">{secondsSinceLast.toFixed(2)}s ago</span>
    ) : "";

    useEffect(() => {
        const stardustTangleCacheService = ServiceFactory.get<StardustTangleCacheService>(
            `tangle-cache-${STARDUST}`
        );

        const refreshMilestoneStats = async () => {
            for (const milestone of milestones) {
                const milestoneId = milestone.milestoneId;

                const msStat = milestoneIdToStats.get(milestoneId);
                if (!msStat) {
                    const milestoneStats = !milestone.blocksCount ?
                        await stardustTangleCacheService.milestoneStats(
                            networkConfig.network, milestoneId
                        ) :
                        {
                            blocksCount: milestone.blocksCount,
                            perPayloadType: milestone.perPayloadType,
                            perInclusionState: milestone.perInclusionState
                        };

                    if (milestoneStats) {
                        milestoneIdToStats.set(milestoneId, milestoneStats);
                        setMilestoneIdToStats(milestoneIdToStats);
                    }
                }
            }
        };

        // eslint-disable-next-line no-void
        void refreshMilestoneStats();
    }, [milestones]);

    const milestonesWithStats: IMilestoneFeedItem[] = [];

    let highestIndex = 0;
    for (const milestone of milestones) {
        const msIndex = milestone.index;
        if (msIndex > highestIndex) {
            highestIndex = msIndex;
        }
        const milestoneId = milestone.milestoneId;
        if (!milestonesWithStats.some(ms => ms.milestoneId === milestoneId)) {
            if (milestoneIdToStats.has(milestoneId)) {
                milestonesWithStats.push({
                    ...milestone,
                    blocksCount: milestoneIdToStats.get(milestoneId)?.blocksCount,
                    perPayloadType: milestoneIdToStats.get(milestoneId)?.perPayloadType,
                    perInclusionState: milestoneIdToStats.get(milestoneId)?.perInclusionState
                });
            }

            if (milestonesWithStats.length === FEED_ITEMS_MAX) {
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
                {milestonesWithStats.length === 0 && (
                    <p>There are no milestones in the feed.</p>
                )}
                {milestonesWithStats.map(milestone => {
                    const blockId = HexHelper.addPrefix(milestone.blockId);
                    const index = milestone.index;
                    const milestoneId = milestone.milestoneId;
                    const milestoneIdShort = `${milestoneId.slice(0, 6)}....${milestoneId.slice(-6)}`;
                    const timestamp = milestone.timestamp * 1000;
                    const includedBlocks = milestone.blocksCount ?? "";
                    const txs = milestone.perPayloadType?.txPayloadCount ?? "";
                    const ago = moment(timestamp).fromNow();
                    const tooltipContent = DateHelper.formatShort(timestamp);

                    return (
                        <div className="feed-item ms-feed" key={milestone.blockId}>
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
