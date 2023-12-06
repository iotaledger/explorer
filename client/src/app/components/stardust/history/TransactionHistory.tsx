/* eslint-disable no-void */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { OutputResponse } from "@iota/sdk-wasm/web";
import { useAddressHistory } from "~helpers/hooks/useAddressHistory";
import NetworkContext from "~app/context/NetworkContext";
import TransactionCard from "./TransactionCard";
import TransactionRow from "./TransactionRow";
import DownloadModal from "../DownloadModal";
import { ITransactionHistoryItem } from "~models/api/stardust/ITransactionHistoryResponse";
import {
    getTransactionHistoryRecords,
    groupOutputsByTransactionId
} from "~app/components/stardust/history/transactionHistoryUtils";
import "./TransactionHistory.scss";


export const calculateBalanceChange = (outputs: (OutputResponse & ITransactionHistoryItem)[]) => {
    return outputs.reduce((acc, output) => {
        if (output.isSpent) {
            return acc - Number(output.output.amount);
        }
        return acc + Number(output.output.amount);
    }, 0);
};

export interface ITransactionHistoryRecord {
    isGenesisByDate: boolean;
    isTransactionFromStardustGenesis: boolean;
    isSpent: boolean;
    transactionLink: string;
    transactionId: string;
    timestamp: number;
    dateFormatted: string;
    balanceChange: number;
    balanceChangeFormatted: string;
    outputs: (OutputResponse & ITransactionHistoryItem)[];
}

export interface TransactionHistoryProps {
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
    const { tokenInfo } = useContext(NetworkContext);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    const transactions = useMemo(() => {
        const transactionIdToOutputs = groupOutputsByTransactionId(historyView, outputDetailsMap);
        return getTransactionHistoryRecords(transactionIdToOutputs, network, tokenInfo, isFormattedAmounts);
    }, [historyView, outputDetailsMap, isFormattedAmounts]);


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
                    {transactions?.map((c, idx) => (
                        <React.Fragment key={idx}>
                            <TransactionRow
                                isGenesisByDate={c.isGenesisByDate}
                                isTransactionFromStardustGenesis={c.isTransactionFromStardustGenesis}
                                transactionLink={c.transactionLink}
                                dateFormatted={c.dateFormatted}
                                balanceChangeFormatted={c.balanceChangeFormatted}
                                transactionId={c.transactionId}
                                isSpent={c.isSpent}
                                isFormattedAmounts={isFormattedAmounts}
                                setIsFormattedAmounts={setIsFormattedAmounts}
                                darkBackgroundRow={idx % 2 === 0}
                            />
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

