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
        // in shimmer, the circulating supply is the same as the total supply
        const totalShimmerSupplyBigInt = BigInt(circulatingSupply);
        // 80% of the Shimmer genesis token supply were distributed to IOTA token holders
        // genesis distribution: https://github.com/iotaledger/tips/blob/main/tips/TIP-0032/tip-0032.md#global-parameters
        const claimableShimmerSupplyBigInt = (totalShimmerSupplyBigInt * BigInt(80)) / BigInt(100);
        // TEA and DAO genesis outputs are spent, so we can assume all unspent genesis outputs are stakers
        const shimmerClaimedBigInt = claimableShimmerSupplyBigInt - BigInt(analytics.unclaimedShimmer);
        claimedAndPercentLabels = buildShimmerClaimedStats(
            shimmerClaimedBigInt.toString(),
            claimableShimmerSupplyBigInt.toString(),
            tokenInfo,
        );
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
