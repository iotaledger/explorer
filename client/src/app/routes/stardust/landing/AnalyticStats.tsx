import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import { buildShimmerClaimedStats, COMMAS_REGEX } from "./ShimmerClaimedUtils";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "~models/api/stats/IAnalyticStats";
import "./AnalyticStats.scss";

interface AnalyticStatsProps {
    readonly analytics: IAnalyticStats | null;
    readonly circulatingSupply: number | undefined;
    readonly tokenInfo: INodeInfoBaseToken;
}

const AnalyticStats: React.FC<AnalyticStatsProps> = ({ analytics, circulatingSupply, tokenInfo }) => {
    const nativeTokensCount = analytics?.nativeTokens;
    const nftsCount = analytics?.nfts;
    const totalAddresses = analytics?.totalAddresses;
    const lockedStorageDepositValue = analytics?.lockedStorageDeposit;

    let claimedAndPercentLabels: [string, string] | undefined;
    if (analytics?.unclaimedShimmer && circulatingSupply) {
        const totalSupplyBigInt = (BigInt(circulatingSupply) * BigInt(100)) / BigInt(80); // https://github.com/iotaledger/explorer/issues/584
        const shimmerClaimedBigInt = totalSupplyBigInt - BigInt(analytics.unclaimedShimmer);
        claimedAndPercentLabels = buildShimmerClaimedStats(shimmerClaimedBigInt.toString(), totalSupplyBigInt.toString(), tokenInfo);
    }

    return analytics && !analytics.error ? (
        <div className="extended-info-boxes">
            {totalAddresses !== undefined && (
                <div className="info-box">
                    <span className="info-box--title">Total active Addresses</span>
                    <span className="info-box--value">{totalAddresses}</span>
                </div>
            )}
            {claimedAndPercentLabels !== undefined && (
                <div className="info-box">
                    <span className="info-box--title">Rewards claimed</span>
                    <span className="info-box--value">{claimedAndPercentLabels[1]}</span>
                </div>
            )}
            {claimedAndPercentLabels !== undefined && (
                <div className="info-box">
                    <span className="info-box--title">Total Shimmer claimed</span>
                    <span className="info-box--value">{claimedAndPercentLabels[0]}</span>
                </div>
            )}
            {nftsCount !== undefined && (
                <div className="info-box">
                    <span className="info-box--title">NFTs minted</span>
                    <span className="info-box--value">{nftsCount}</span>
                </div>
            )}
            {nativeTokensCount !== undefined && (
                <div className="info-box">
                    <span className="info-box--title">Tokens created</span>
                    <span className="info-box--value">{nativeTokensCount}</span>
                </div>
            )}
            {lockedStorageDepositValue !== undefined && (
                <div className="info-box">
                    <span className="info-box--title">Locked storage deposit</span>
                    <span className="info-box--value">
                        {formatAmount(Number(lockedStorageDepositValue), tokenInfo).replace(COMMAS_REGEX, ",")}
                    </span>
                </div>
            )}
        </div>
    ) : null;
};

export default AnalyticStats;
