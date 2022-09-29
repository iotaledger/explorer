import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import React from "react";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import { IShimmerClaimed } from "../../../../models/api/stats/IShimmerClaimed";
import { buildShimmerClaimedStats } from "./ShimmerClaimedUtils";
import "./AnalyticStats.scss";

interface AnalyticStatsProps {
    analytics: IAnalyticStats | undefined;
    circulatingSupply: number | undefined;
    shimmerClaimed: IShimmerClaimed | undefined;
    tokenInfo: INodeInfoBaseToken;
}

const AnalyticStats: React.FC<AnalyticStatsProps> = (
    { analytics, shimmerClaimed, circulatingSupply, tokenInfo }
) => {
    const nativeTokensCount = analytics?.nativeTokens?.count;
    const nftsCount = analytics?.nfts?.count;
    const totalAddresses = analytics?.totalAddresses?.totalActiveAddresses;
    const lockedStorageDepositValue = analytics?.lockedStorageDeposit?.totalByteCost;

    let claimedAndPercentLabels: [string, string] | undefined;
    if (shimmerClaimed?.count && circulatingSupply) {
        claimedAndPercentLabels = buildShimmerClaimedStats(
            shimmerClaimed.count,
            String(circulatingSupply),
            tokenInfo
        );
    } else if (analytics?.shimmerClaimed?.count && circulatingSupply) {
        claimedAndPercentLabels = buildShimmerClaimedStats(
            analytics.shimmerClaimed.count,
            String(circulatingSupply),
            tokenInfo
        );
    }

    return (
        analytics && !analytics.error ? (
            <div className="extended-info-boxes">
                <div className="row space-between">
                    {totalAddresses && (
                        <div className="info-box">
                            <span className="info-box--title">Total active Addresses</span>
                            <span className="info-box--value">{totalAddresses}</span>
                        </div>
                    )}
                    {claimedAndPercentLabels && (
                        <div className="info-box">
                            <span className="info-box--title">Rewards claimed</span>
                            <span className="info-box--value">{claimedAndPercentLabels[1]}</span>
                        </div>
                    )}
                    {claimedAndPercentLabels && (
                        <div className="info-box">
                            <span className="info-box--title">Total Shimmer claimed</span>
                            <span className="info-box--value">
                                {claimedAndPercentLabels[0]}
                            </span>
                        </div>
                    )}
                </div>
                <div className="row space-between">
                    {nftsCount && (
                        <div className="info-box">
                            <span className="info-box--title">NFTs minted</span>
                            <span className="info-box--value">{nftsCount}</span>
                        </div>
                    )}
                    {nativeTokensCount && (
                        <div className="info-box">
                            <span className="info-box--title">Tokens created</span>
                            <span className="info-box--value">{nativeTokensCount}</span>
                        </div>
                    )}
                    {lockedStorageDepositValue && (
                        <div className="info-box">
                            <span className="info-box--title">Locked storage deposit</span>
                            <span className="info-box--value">
                                {formatAmount(Number(lockedStorageDepositValue), tokenInfo)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        ) : null
    );
};

export default AnalyticStats;

