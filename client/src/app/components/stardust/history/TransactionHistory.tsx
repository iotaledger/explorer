/* eslint-disable no-void */
import React, {useEffect, useMemo, useState} from "react";
import {useAddressHistory} from "~helpers/hooks/useAddressHistory";
import DownloadModal from "../DownloadModal";
import {OutputResponse} from "@iota/sdk-wasm/web";
import {ITransactionHistoryItem} from "~models/api/stardust/ITransactionHistoryResponse";

/** Local imports */
import "./TransactionHistory.scss";
import TransactionCard from "./TransactionCard";
import TransactionRow from "./TransactionRow";
import { ICalculatedTransaction, TransactionHistoryProps } from "./history.types";
import {calculateBalanceChange, mapByTransactionId} from "./history.helpers";


const TransactionHistory: React.FC<TransactionHistoryProps> = (
    { network, address, setLoading, setDisabled }
) => {
    let [historyView, outputDetailsMap, loadMore, isLoading, hasMore] = useAddressHistory(
        network,
        address,
        setDisabled
    );
    const [isFormattedAmounts, setIsFormattedAmounts] = useState(true);

    // historyView = [];
    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    const byTransactionId = useMemo(() => {
        return mapByTransactionId(historyView, outputDetailsMap);
    }, [historyView]);

    const calculatedTransactions = useMemo(() => {
        const calculatedTransactions: ICalculatedTransaction[] = [];
        Object.keys(byTransactionId).forEach((transactionId) => {
            const transactions = byTransactionId[transactionId];
            const transactionFirst = transactions[0];

            calculatedTransactions.push({
                transactionId: transactionId,
                timestamp: transactionFirst.milestoneTimestamp,
                balanceChange: calculateBalanceChange(transactions),
                outputs: transactions
            });
        });
        return calculatedTransactions;
    }, [
        byTransactionId
    ]);

    console.log('--- calculatedTransactions', calculatedTransactions);

    return (historyView.length > 0 && address ? (
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
                    {calculatedTransactions?.map((c, idx) => (
                        <React.Fragment key={idx}>
                            <TransactionRow
                                outputId={''}
                                transactionId={c.transactionId}
                                date={c.timestamp}
                                milestoneIndex={0}
                                value={Math.abs(c.balanceChange)}
                                isSpent={c.balanceChange < 0}
                                isFormattedAmounts={isFormattedAmounts}
                                setIsFormattedAmounts={setIsFormattedAmounts}
                                darkBackgroundRow={idx % 2 === 0}
                            />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* Only visible in mobile -- Card transactions*/}
            <div className="transaction-history--cards">
                {historyView.length > 0 && (
                    historyView.map((historyItem, idx) => {
                        const outputDetails = outputDetailsMap[historyItem.outputId];
                        if (!outputDetails) {
                            return null;
                        }
                        const transactionId = historyItem.isSpent ?
                            outputDetails.metadata.transactionIdSpent :
                            outputDetails.metadata.transactionId;

                        if (!transactionId) {
                            return null;
                        }

                        return (
                            <React.Fragment key={idx}>
                                <TransactionCard
                                    outputId={historyItem.outputId}
                                    transactionId={transactionId}
                                    date={historyItem.milestoneTimestamp}
                                    milestoneIndex={historyItem.milestoneIndex}
                                    value={Number(outputDetails.output.amount)}
                                    isSpent={historyItem.isSpent}
                                    isFormattedAmounts={isFormattedAmounts}
                                    setIsFormattedAmounts={setIsFormattedAmounts}
                                />
                            </React.Fragment>
                        );
                    })
                )}
            </div>
            {hasMore && historyView.length > 0 && (
                <div className="card load-more--button" onClick={loadMore}>
                    <button type="button">Load more...</button>
                </div>
            )}
        </div>) :
        <div className="section transaction-history--section">
            <div className="section">
                <div className="section--data">
                    <p>
                        There are no transactions for this address.
                    </p>
                </div>
            </div>
        </div>
    );
};

TransactionHistory.defaultProps = {
    address: undefined,
    setDisabled: undefined
};

export default TransactionHistory;

