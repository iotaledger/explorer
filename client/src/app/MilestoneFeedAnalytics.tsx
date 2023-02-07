import React, { useEffect, useState } from "react";
import { ServiceFactory } from "../factories/serviceFactory";
import { IMilestoneAnalyticStats } from "../models/api/stats/IMilestoneAnalyticStats";
import { STARDUST } from "../models/config/protocolVersion";
import { StardustTangleCacheService } from "../services/stardust/stardustTangleCacheService";
import Spinner from "./components/Spinner";

interface MilestoneFeedAnalyicsProps {
    network: string;
    milestoneIndex: number;
}

const MilestoneFeedAnalyics: React.FC<MilestoneFeedAnalyicsProps> = ({ network, milestoneIndex }) => {
    const [tangleCacheService] = useState(ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`));
    const [milestoneStats, setMilestoneStats] = useState<IMilestoneAnalyticStats | undefined>();
    const [fetching, setFetching] = useState<boolean>(true);

    useEffect(() => {
        const refreshMilestoneStats = async () => {
            const maybeMilestoneStats = await tangleCacheService.milestoneStats(
                network, milestoneIndex.toString()
            );
            if (maybeMilestoneStats) {
                setMilestoneStats(maybeMilestoneStats);
            }
            setFetching(false);
        };
        // eslint-disable-next-line no-void
        void refreshMilestoneStats();
    }, []);

    let includedBlocks: string | undefined;
    let txs: string | undefined;

    if (milestoneStats) {
        includedBlocks = milestoneStats.blockCount?.toString();
        txs = milestoneStats.perPayloadType?.transaction?.toString();
    }

    return (
        <React.Fragment>
            <div className="feed-item__content">
                <span className="feed-item--label">Blocks</span>
                <span className="feed-item--value ms-blocks">
                    {fetching ?
                        <Spinner compact /> :
                        <div className="feed-item__ms-stat">{includedBlocks ?? "--"}</div>}
                </span>
            </div>
            <div className="feed-item__content">
                <span className="feed-item--label">Txs</span>
                <span className="feed-item--value ms-txs">
                    {fetching ?
                        <Spinner compact /> :
                        <div className="feed-item__ms-stat">{txs ?? "--"}</div>}
                </span>
            </div>
        </React.Fragment>
    );
};

export default MilestoneFeedAnalyics;

