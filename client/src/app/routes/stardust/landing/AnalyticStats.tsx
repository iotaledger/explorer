import { INodeInfoBaseToken } from "@iota/sdk-wasm/web";
import React from "react";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import { buildShimmerClaimedStats, COMMAS_REGEX } from "./ShimmerClaimedUtils";
import "./AnalyticStats.scss";

interface AnalyticStatsProps {
    analytics: IAnalyticStats | null;
    circulatingSupply: number | undefined;
    tokenInfo: INodeInfoBaseToken;
}

const AnalyticStats: React.FC<AnalyticStatsProps> = (
    { analytics, circulatingSupply, tokenInfo }
) => {
    const nativeTokensCount = analytics?.nativeTokens;
    const nftsCount = analytics?.nfts;
    const totalAddresses = analytics?.totalAddresses;
    const lockedStorageDepositValue = analytics?.lockedStorageDeposit;

    let claimedAndPercentLabels: [string, string] | undefined;
    if (analytics?.unclaimedShimmer && circulatingSupply) {
        // magic number since influx doesn't account for the unclaimable portion of 20%
        const shimmerClaimed = circulatingSupply - (Number.parseInt(analytics.unclaimedShimmer, 10) - 362724101812273);
        claimedAndPercentLabels = buildShimmerClaimedStats(
            shimmerClaimed.toString(),
            String(circulatingSupply),
            tokenInfo
        );
    }

    return (
        analytics && !analytics.error ? (
            <div className="extended-info-boxes">
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
                            {formatAmount(
                                Number(lockedStorageDepositValue),
                                tokenInfo
                            ).replace(COMMAS_REGEX, ",")}
                        </span>
                    </div>
                )}
            </div>
        ) : null
    );
};

export default AnalyticStats;

