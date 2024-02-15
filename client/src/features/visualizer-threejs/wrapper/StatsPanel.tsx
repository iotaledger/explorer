import React from "react";

export const StatsPanel = ({ bps }: { bps: number }) => {
    return (
        <div className="stats-panel-container">
            <div className="card">
                <div className="stats-panel__info">
                    <div className="card--label">BPS</div>
                    <div className="card--value green">{parseInt(String(bps))}</div>
                </div>
            </div>
        </div>
    );
};
