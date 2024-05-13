import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMilestoneStats } from "~helpers/stardust/hooks/useMilestoneStats";
import Spinner from "../../../components/Spinner";

interface MilestoneFeedAnalyicsProps {
    readonly network: string;
    readonly milestoneIndex: number;
    readonly blockId: string;
}

const MilestoneFeedAnalyics: React.FC<MilestoneFeedAnalyicsProps> = ({ network, milestoneIndex, blockId }) => {
    const [milestoneStats, isLoading] = useMilestoneStats(network, milestoneIndex.toString());
    const [includedBlocks, setIncludedBlocks] = useState<string | undefined>();
    const [txs, setTxs] = useState<string | undefined>();

    useEffect(() => {
        if (milestoneStats) {
            setIncludedBlocks(milestoneStats.blockCount?.toString());
            setTxs(milestoneStats.perPayloadType?.transaction?.toString());
        }
    }, [milestoneStats]);

    return (
        <React.Fragment>
            <div className="feed-item__content">
                <span className="feed-item--label">Blocks</span>
                <span className="feed-item--value ms-blocks">
                    {isLoading ? (
                        <Spinner compact />
                    ) : (
                        <div className="feed-item__ms-stat">
                            <Link className="feed-item--hash ms-id" to={`/${network}/block/${blockId}?tab=RefBlocks`}>
                                {includedBlocks ?? "--"}
                            </Link>
                        </div>
                    )}
                </span>
            </div>
            <div className="feed-item__content">
                <span className="feed-item--label">Txs</span>
                <span className="feed-item--value ms-txs">
                    {isLoading ? (
                        <Spinner compact />
                    ) : (
                        <div className="feed-item__ms-stat">
                            <Link className="feed-item--hash ms-id" to={`/${network}/block/${blockId}?tab=RefBlocks`}>
                                {txs ?? "--"}
                            </Link>
                        </div>
                    )}
                </span>
            </div>
        </React.Fragment>
    );
};

export default MilestoneFeedAnalyics;
