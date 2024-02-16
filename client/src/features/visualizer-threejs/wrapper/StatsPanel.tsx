import React, { useEffect } from "react";
import { useNetworkStats } from "~helpers/stardust/hooks/useNetworkStats";

export const StatsPanel: React.FC<{ readonly blocksCount: number; readonly network: string; readonly isPlaying: boolean }> = ({
    blocksCount,
    network,
    isPlaying,
}) => {
    const [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent] = useNetworkStats(network);
    const [blocksInScreen, setBlocksInScreen] = React.useState<number>(0);

    /**
     * Sets BPS only when blocks are being emitted.
     */
    useEffect(() => {
        if (isPlaying) {
            setBlocksInScreen(blocksCount);
        }
    }, [isPlaying, blocksCount]);

    return (
        <div className="stats-panel-container">
            <div className="card stats-panel">
                <div className="card--content">
                    <div className="stats-panel__info">
                        <div className="card--label">Blocks</div>
                        <div className="card--value">{blocksInScreen}</div>
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
