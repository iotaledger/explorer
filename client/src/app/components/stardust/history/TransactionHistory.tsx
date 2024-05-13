/* eslint-disable no-void */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAddressHistory } from "~helpers/stardust/hooks/useAddressHistory";
import NetworkContext from "~app/context/NetworkContext";
import DownloadModal from "../DownloadModal";
import { getTransactionHistoryRecords } from "./transactionHistoryUtils";
import TransactionRow from "./TransactionRow";
import TransactionCard from "./TransactionCard";
import "./TransactionHistory.scss";

export interface TransactionHistoryProps {
    readonly network: string;
    readonly address?: string;
    readonly setLoading: (isLoadin: boolean) => void;
    readonly setDisabled?: (isDisabled: boolean) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ network, address, setLoading, setDisabled }) => {
    const [transactionIdToOutputs, loadMore, isLoading, hasMore] = useAddressHistory(network, address, setDisabled);

    const [isFormattedAmounts, setIsFormattedAmounts] = useState(true);
    const { tokenInfo } = useContext(NetworkContext);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    const transactions = useMemo(() => {
        const transactionsLocal = getTransactionHistoryRecords(transactionIdToOutputs, network, tokenInfo, isFormattedAmounts);
        if (hasMore) {
            // remove last transaction, as it's potentially doesn't have all outputs
            transactionsLocal.pop();
        }
        return transactionsLocal;
    }, [transactionIdToOutputs, tokenInfo, isFormattedAmounts, hasMore]);

    return transactions.length > 0 && address ? (
        <div className="section transaction-history--section">
            <div className="section--header row end">
                <DownloadModal network={network} address={address} />
            </div>
            <table className="transaction-history--table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Transaction Id</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions?.map((c, idx) => (
                        <React.Fragment key={idx}>
                            <TransactionRow {...c} isFormattedAmounts={isFormattedAmounts} setIsFormattedAmounts={setIsFormattedAmounts} />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/** Only visible in mobile -- Card transactions */}
            <div className="transaction-history--cards">
                {transactions.map((c, idx) => {
                    return (
                        <React.Fragment key={idx}>
                            <TransactionCard
                                isGenesisByDate={c.isGenesisByDate}
                                isTransactionFromStardustGenesis={c.isTransactionFromStardustGenesis}
                                transactionLink={c.transactionLink}
                                dateFormatted={c.dateFormatted}
                                balanceChangeFormatted={c.balanceChangeFormatted}
                                transactionId={c.transactionId}
                                isSpent={c.isSpent}
                                isFormattedAmounts={isFormattedAmounts}
                                setIsFormattedAmounts={setIsFormattedAmounts}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
            {hasMore && transactions.length > 0 && (
                <div className="card load-more--button" onClick={loadMore}>
                    <button type="button">Load more...</button>
                </div>
            )}
        </div>
    ) : (
        <div className="section transaction-history--section">
            <div className="section">
                <div className="section--data">
                    <p>There are no transactions for this address.</p>
                </div>
            </div>
        </div>
    );
};

TransactionHistory.defaultProps = {
    address: undefined,
    setDisabled: undefined,
};

export default TransactionHistory;
