import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import React from "react";
import { BigDecimal } from "../../../../helpers/bigDecimal";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import { IShimmerClaimStats } from "../../../../models/api/stats/IShimmerClaimingStatsResponse";
import "./AnalyticStats.scss";

interface AnalyticStatsProps {
    analytics: IAnalyticStats | undefined;
    shimmerClaimingStats: IShimmerClaimStats | undefined;
    circulatingSupply: number | undefined;
    tokenInfo: INodeInfoBaseToken;
}

const AnalyticStats: React.FC<AnalyticStatsProps> = (
    { analytics, shimmerClaimingStats, circulatingSupply, tokenInfo }
) => {
    const nativeTokensCount = analytics?.nativeTokens?.count;
    const nftsCount = analytics?.nfts?.count;
    const totalAddresses = analytics?.totalAddresses?.totalActiveAddresses;
    const dailyAddresses = analytics?.dailyAddresses?.totalActiveAddresses;
    const lockedStorageDepositValue = analytics?.lockedStorageDeposit?.totalValue;

    let shimmerClaimed: BigDecimal | undefined;
    let shimmerClaimedPercent: BigDecimal | undefined;
    if (shimmerClaimingStats && circulatingSupply) {
        shimmerClaimed = new BigDecimal(shimmerClaimingStats.count);
        shimmerClaimedPercent = shimmerClaimed.multiply("100").divide(String(circulatingSupply));
    } else if (analytics?.totalShimmerTokensClaimed?.count && circulatingSupply) {
        shimmerClaimed = new BigDecimal(analytics.totalShimmerTokensClaimed.count);
        shimmerClaimedPercent = shimmerClaimed.multiply("100").divide(String(circulatingSupply));
    }

    return (
        analytics && !analytics.error ? (
            <div className="extended-info-boxes">
                <div className="row space-between">
                    {totalAddresses && (
                        <div className="info-box">
                            <span className="info-box--title">Total Addresses</span>
                            <span className="info-box--value">{totalAddresses}</span>
                        </div>
                    )}
                    {dailyAddresses && (
                        <div className="info-box">
                            <span className="info-box--title">Daily Addresses</span>
                            <span className="info-box--value">{dailyAddresses}</span>
                        </div>
                    )}
                    {shimmerClaimed && (
                        <div className="info-box">
                            <span className="info-box--title">Shimmer claimed</span>
                            <span className="info-box--value">
                                {formatAmount(
                                    Number(shimmerClaimed.toString()),
                                    tokenInfo,
                                    false
                                )}
                            </span>
                        </div>
                    )}
                    {shimmerClaimedPercent && (
                        <div className="info-box">
                            <span className="info-box--title">Shimmer claimed %</span>
                            <span className="info-box--value">{shimmerClaimedPercent.toString()}%</span>
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
                                {formatAmount(lockedStorageDepositValue, tokenInfo)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        ) : null
    );
};

export default AnalyticStats;

