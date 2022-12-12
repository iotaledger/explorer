import React from "react";
import "./AnalyticStats.scss";
import { IProtoStats } from "../../../../models/api/stats/IProtoStats";
import MiniTooltip from "../../../components/MiniTooltip";

interface AnalyticStatsProps {
    protoStats: IProtoStats | undefined;
}

const MANA_STAT_HELPER_TXT = "The amount of mana which is active in comparison to the theoretical maximum" +
    " mana within the system";
const NODES_ONLINE_HELPER_TXT = "Healthy nodes which were online in the last 24 hours";
const TXS_BOOKED_24H_HELPER_TXT = "Amount of transactions which got booked into the ledger in the last 24 hours " +
    "(excluding double spends and transactions which were not part of any ledger updates)";
const CONFLICTS_RESOLVED_24H_HELPER_TXT = "Amount of conflicts which got actively resolved through OTV in the " +
    "last 24 hours";

const AnalyticStats: React.FC<AnalyticStatsProps> = (
    { protoStats }
) => {
    const conflictsResolved24h = protoStats?.conflictsResolved24h ?? 23;
    const nodesOnline = protoStats?.nodesOnline ?? 100;
    const txsBooked24h = protoStats?.txsBooked24h ?? 34;

    let activeRatio = 0;
    if (protoStats?.totalMana) {
        activeRatio = protoStats.activeMana / protoStats.totalMana;
    }
    activeRatio = activeRatio || 78;

    return (
        <div className="extended-info-boxes">
            <div className="row space-between">
                {activeRatio &&
                    <div className="info-box">
                        <span className="info-box--title">
                            <MiniTooltip tooltipContent={MANA_STAT_HELPER_TXT}>
                                <span className="info-box--title">Active Mana Ratio</span>
                            </MiniTooltip>
                        </span>
                        <span className="info-box--value">{activeRatio}%</span>
                    </div>}
                {nodesOnline &&
                    <div className="info-box">
                        <span className="info-box--title">
                            <MiniTooltip tooltipContent={NODES_ONLINE_HELPER_TXT}>
                                <span className="info-box--title">Nodes Online</span>
                            </MiniTooltip>
                        </span>
                        <span className="info-box--value">{nodesOnline}</span>
                    </div>}
            </div>
            <div className="row space-between">
                {txsBooked24h && (
                    <div className="info-box">
                        <span className="info-box--title">
                            <MiniTooltip tooltipContent={TXS_BOOKED_24H_HELPER_TXT}>
                                <span className="info-box--title">Transactions (24h)</span>
                            </MiniTooltip>
                        </span>
                        <span className="info-box--value">{txsBooked24h}</span>
                    </div>
                )}
                {conflictsResolved24h && (
                    <div className="info-box">
                        <span className="info-box--title">
                            <MiniTooltip tooltipContent={CONFLICTS_RESOLVED_24H_HELPER_TXT}>
                                <span className="info-box--title">Conflicts Resolved (24h)</span>
                            </MiniTooltip>
                        </span>
                        <span className="info-box--value">{conflictsResolved24h}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticStats;

