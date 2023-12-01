/* eslint-disable no-void */
import React, {useCallback, useEffect, useMemo, useState} from "react";
import TransactionCard from "./TransactionCard";
import TransactionRow from "./TransactionRow";
import { useAddressHistory } from "~helpers/hooks/useAddressHistory";
import DownloadModal from "../DownloadModal";
import "./TransactionHistory.scss";
import {OutputResponse} from "@iota/sdk-wasm/web";
import {ITransactionHistoryItem} from "~models/api/stardust/ITransactionHistoryResponse";

interface TransactionHistoryProps {
    readonly network: string;
    readonly address?: string;
    readonly setLoading: (isLoadin: boolean) => void;
    readonly setDisabled?: (isDisabled: boolean) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = (
    { network, address, setLoading, setDisabled }
) => {
    const [historyView, outputDetailsMap, loadMore, isLoading, hasMore] = useAddressHistory(
        network,
        address,
        setDisabled
    );
    const [isFormattedAmounts, setIsFormattedAmounts] = useState(true);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    let isDarkBackgroundRow = false;

    const byTransactionId = useMemo(() => {
        const byTransactionId: { [key: string]: (OutputResponse & ITransactionHistoryItem)[] } = {};
        historyView.forEach((historyItem) => {
            const outputDetails = outputDetailsMap[historyItem.outputId];
            if (!outputDetails) {
                return;
            }
            const transactionId = historyItem.isSpent ?
                outputDetails.metadata.transactionIdSpent :
                outputDetails.metadata.transactionId;

            if (!transactionId) {
                return;
            }

            if (!byTransactionId[transactionId]) {
                byTransactionId[transactionId] = [];
            }

            byTransactionId[transactionId].push({...historyItem, ...outputDetails});
        });
        return byTransactionId;
    }, [historyView]);

    const calculateTransactionBalance = useCallback((outputs: (OutputResponse & ITransactionHistoryItem)[]) => {
        return outputs.reduce((acc, output) => {
            if (output.isSpent) {
                return acc - Number(output.output.amount);
            }
            return acc + Number(output.output.amount);
        }, 0);
    }, []);

    const calculatedTransactions = useMemo(() => {
        const calculatedTransactions: {
            transactionId: string;
            timestamp: number;
            balanceChange: number;
            outputs: (OutputResponse & ITransactionHistoryItem)[];
        }[] = [];
        Object.keys(byTransactionId).forEach((transactionId) => {
            const transaction = byTransactionId[transactionId];
            const transactionFirst = transaction[0];

            const res = {
                transactionId: transactionId,
                timestamp: transactionFirst.milestoneTimestamp,
                balanceChange: calculateTransactionBalance(transaction),
                outputs: transaction
            };
            calculatedTransactions.push(res);
        });
        return calculatedTransactions;
    }, [
        byTransactionId
    ]);

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
                {/*<tbody>*/}
                {/*    {historyView.length > 0 && (*/}
                {/*        historyView.map((historyItem, idx) => {*/}
                {/*            const outputDetails = outputDetailsMap[historyItem.outputId];*/}
                {/*            if (!outputDetails) {*/}
                {/*                return null;*/}
                {/*            }*/}
                {/*            const transactionId = historyItem.isSpent ?*/}
                {/*                outputDetails.metadata.transactionIdSpent :*/}
                {/*                outputDetails.metadata.transactionId;*/}

                {/*            if (!transactionId) {*/}
                {/*                return null;*/}
                {/*            }*/}

                {/*            // rotate row background colour for different transaction ids*/}
                {/*            if (idx > 0) {*/}
                {/*                const previousItemDetails = outputDetailsMap[historyView[idx - 1].outputId];*/}
                {/*                const previousSpent = historyView[idx - 1].isSpent;*/}
                {/*                if (previousItemDetails) {*/}
                {/*                    const previousTransactionId = previousSpent ?*/}
                {/*                        previousItemDetails.metadata.transactionIdSpent :*/}
                {/*                        previousItemDetails.metadata.transactionId;*/}

                {/*                    if (transactionId !== previousTransactionId) {*/}
                {/*                        isDarkBackgroundRow = !isDarkBackgroundRow;*/}
                {/*                    }*/}
                {/*                }*/}
                {/*            }*/}

                {/*            return (*/}
                {/*                <React.Fragment key={idx}>*/}
                {/*                    <TransactionRow*/}
                {/*                        outputId={historyItem.outputId}*/}
                {/*                        transactionId={transactionId}*/}
                {/*                        date={historyItem.milestoneTimestamp}*/}
                {/*                        milestoneIndex={historyItem.milestoneIndex}*/}
                {/*                        value={Number(outputDetails.output.amount)}*/}
                {/*                        isSpent={historyItem.isSpent}*/}
                {/*                        isFormattedAmounts={isFormattedAmounts}*/}
                {/*                        setIsFormattedAmounts={setIsFormattedAmounts}*/}
                {/*                        darkBackgroundRow={isDarkBackgroundRow}*/}
                {/*                    />*/}
                {/*                </React.Fragment>*/}
                {/*            );*/}
                {/*        })*/}
                {/*    )}*/}
                {/*</tbody>*/}
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

