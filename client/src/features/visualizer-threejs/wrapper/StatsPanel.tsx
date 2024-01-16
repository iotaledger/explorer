import React from "react";
import { useNetworkStats } from "~helpers/stardust/hooks/useNetworkStats";

export const StatsPanel: React.FC<{ readonly blocksCount: number; readonly network: string }> = ({ blocksCount, network }) => {
    const [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent] = useNetworkStats(network);

    return (
        <div className="stats-panel-container">
            <div className="card stats-panel">
                <div className="card--content">
                    <div className="stats-panel__info">
                        <div className="card--label">Blocks</div>
                        <div className="card--value">{blocksCount}</div>
                    </div>
                    <div className="stats-panel__info">
                        <div className="card--label">BPS / CBPS</div>
                        <div className="card--value">
                            {blocksPerSecond} / {confirmedBlocksPerSecond}
                        </div>
                    </div>
                    <div className="stats-panel__info">
                        <div className="card--label">Referenced Rate</div>
                        <div className="card--value">{confirmedBlocksPerSecondPercent}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
