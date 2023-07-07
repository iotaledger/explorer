import React from "react";
import { useNetworkStats } from "../../../../helpers/hooks/useNetworkStats";

export const StatsPanel = ({ blocksCount, network }: {blocksCount: number; network: string}) => {
    const [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent] = useNetworkStats(network);

    return (
        <div className="stats-panel-container">
            <div className="card stats-panel">
                <div className="card--content">
                    <div className="stats-panel__info">
                        <div className="card--label">Blocks</div>
                        <div className="card--value">
                            {blocksCount}
                        </div>
                    </div>
                    <div className="stats-panel__info">
                        <div className="card--label">BPS / CBPS</div>
                        <div className="card--value">
                            {blocksPerSecond} / {confirmedBlocksPerSecond}
                        </div>
                    </div>
                    <div className="stats-panel__info">
                        <div className="card--label">Referenced Rate</div>
                        <div className="card--value">
                            {confirmedBlocksPerSecondPercent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};