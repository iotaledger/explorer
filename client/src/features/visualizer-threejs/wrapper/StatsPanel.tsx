import React from "react";
import { useNetworkStats } from "~helpers/stardust/hooks/useNetworkStats";
import Modal from "~app/components/Modal";

export const StatsPanel: React.FC<{ readonly blocksCount: number; readonly network: string }> = ({ blocksCount, network }) => {
    const [blocksPerSecond, confirmedBlocksPerSecond, confirmedBlocksPerSecondPercent] = useNetworkStats(network);

    return (
        <div className="stats-panel-container">
            <div className="card stats-panel">
                <div className="card--content">

                    <div className="stats-panel__info">
                        {/*@ts-ignore*/}
                        <div className="card--label">BPS <div style={{marginLeft: '2px'}}><Modal icon="info" /></div></div>
                        <div className="card--value green">
                            130
                        </div>
                    </div>
                    <div className="stats-panel__info">
                        <div className="card--label">Avg block time</div>
                        <div className="card--value">10s</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
