import { INodeInfoBaseToken, UnitsHelper } from "@iota/iota.js-stardust";
import React from "react";
import { BigDecimal } from "../../../../helpers/bigDecimal";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import { IShimmerClaimed } from "../../../../models/api/stats/IShimmerClaimed";
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
    const dailyAddresses = analytics?.dailyAddresses?.totalActiveAddresses;
    const lockedStorageDepositValue = analytics?.lockedStorageDeposit?.totalValue;

    let claimedCout: BigDecimal | undefined;
    let shimmerClaimedPercent: BigDecimal | undefined;
    if (shimmerClaimed && circulatingSupply) {
        claimedCout = new BigDecimal(shimmerClaimed.count);
        BigDecimal.DECIMALS = 12;
        // claimedCout = new BigDecimal("123123");
        shimmerClaimedPercent = claimedCout.multiply("100").divide(String(circulatingSupply));
    } else if (analytics?.shimmerClaimed?.count && circulatingSupply) {
        claimedCout = new BigDecimal(analytics.shimmerClaimed.count);
        shimmerClaimedPercent = claimedCout.multiply("100").divide(String(circulatingSupply));
    }

    let formattedClaimed: string | undefined;
    if (claimedCout) {
        const amount = formatAmount(Number(claimedCout), tokenInfo, true);
        const [amountNoUnit, unit] = amount.split(" ");
        formattedClaimed = UnitsHelper.formatBest(Number(amountNoUnit)) + unit;
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
                    {formattedClaimed && (
                        <div className="info-box">
                            <span className="info-box--title">Shimmer claimed</span>
                            <span className="info-box--value">
                                {formattedClaimed}
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

