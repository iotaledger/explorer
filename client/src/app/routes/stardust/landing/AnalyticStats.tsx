import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import React from "react";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { IAnalyticStats } from "../../../../models/api/stats/IAnalyticStats";
import "./AnalyticStats.scss";

interface AnalyticStatsProps {
    analytics: IAnalyticStats | undefined;
    tokenInfo: INodeInfoBaseToken;
}

const AnalyticStats: React.FC<AnalyticStatsProps> = ({ analytics, tokenInfo }) => {
    const nativeTokensCount = analytics?.nativeTokens?.count;
    const nftsCount = analytics?.nfts?.count;
    const totalAddresses = analytics?.totalAddresses?.totalActiveAddresses;
    const dailyAddresses = analytics?.dailyAddresses?.totalActiveAddresses;
    const lockedStorageDepositValue = analytics?.lockedStorageDeposit?.totalValue;
    const dailyTransactions = analytics?.dailyTransactions?.count;

    return (
        analytics && !analytics.error ? (
            <div className="extended-info-boxes">
                <div className="row space-between">
                    {nativeTokensCount && (
                        <div className="info-box">
                            <span className="info-box--title">Tokens created</span>
                            <span className="info-box--value">{nativeTokensCount}</span>
                        </div>
                    )}
                    {nftsCount && (
                        <div className="info-box">
                            <span className="info-box--title">NFTs minted</span>
                            <span className="info-box--value">{nftsCount}</span>
                        </div>
                    )}
                    {dailyAddresses && (
                        <div className="info-box">
                            <span className="info-box--title">Daily Addresses</span>
                            <span className="info-box--value">{dailyAddresses}</span>
                        </div>
                    )}
                </div>
                <div className="row space-between">
                    {totalAddresses && (
                        <div className="info-box">
                            <span className="info-box--title">Total Addresses</span>
                            <span className="info-box--value">{totalAddresses}</span>
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
                    {dailyTransactions && (
                        <div className="info-box">
                            <span className="info-box--title">Daily transactions</span>
                            <span className="info-box--value">{dailyTransactions}</span>
                        </div>
                    )}
                </div>
            </div>
        ) : null
    );
};

export default AnalyticStats;

