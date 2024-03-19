import React, { memo } from "react";
import { useNetworkStats } from "~helpers/nova/hooks/useNetworkStats";

export const StatsPanel = ({ network }: { network: string }) => {
    const { blocksPerSecond } = useNetworkStats(network);
    return (
        <div className="stats-panel-container">
            <div className="card">
                <div className="stats-panel__info">
                    <div className="card--label">BPS</div>
                    <div className="card--value green">{blocksPerSecond}</div>
                </div>
            </div>
        </div>
    );
};

export default memo(StatsPanel);
