/* eslint-disable no-void */
import React, {useContext, useEffect, useMemo, useState} from "react";
import moment from "moment";
import {useAddressHistory} from "~helpers/hooks/useAddressHistory";
import DownloadModal from "../DownloadModal";
import {DateHelper} from "~helpers/dateHelper";
import {formatAmount} from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "~app/context/NetworkContext";

/** Local imports */
import "./TransactionHistory.scss";
import TransactionCard from "./TransactionCard";
import TransactionRow from "./TransactionRow";
import { ICalculatedTransaction, TransactionHistoryProps } from "./history.types";
import {calculateBalanceChange, mapByTransactionId} from "./history.helpers";
import {TransactionsHelper} from "~helpers/stardust/transactionsHelper";
import {CHRYSALIS_MAINNET} from "~models/config/networkType";


const TransactionHistory: React.FC<TransactionHistoryProps> = (
    { network, address, setLoading, setDisabled }
) => {
    let [historyView, outputDetailsMap, loadMore, isLoading, hasMore] = useAddressHistory(
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
        const byTransactionId = mapByTransactionId(historyView, outputDetailsMap);
        const calculatedTransactions: ICalculatedTransaction[] = [];
        Object.keys(byTransactionId).forEach((transactionId) => {
            const transactions = byTransactionId[transactionId];
            const transactionFirst = transactions[0];
            const balanceChange = calculateBalanceChange(transactions);
            const ago = moment(transactionFirst.milestoneTimestamp * 1000).fromNow();

            const isGenesisByDate = transactions
                .map((t) => t.milestoneTimestamp)
                .some((milestoneTimestamp) => milestoneTimestamp === 0);

            const milestoneIndexes = transactions.map((t) => t.milestoneIndex);
            const isTransactionFromStardustGenesis = milestoneIndexes
                .map(milestoneIndex => TransactionsHelper.isTransactionFromIotaStardustGenesis(network, milestoneIndex))
                .some(isTransactionFromStardustGenesis => isTransactionFromStardustGenesis);

            const transactionLink = isTransactionFromStardustGenesis ?
                `/${CHRYSALIS_MAINNET}/search/${transactionId}` :
                `/${network}/transaction/${transactionId}`;

            const isSpent = balanceChange < 0;

            calculatedTransactions.push({
                isGenesisByDate: isGenesisByDate,
                isTransactionFromStardustGenesis: isTransactionFromStardustGenesis,
                isSpent: isSpent,
                transactionLink: transactionLink,
                transactionId: transactionId,
                timestamp: transactionFirst.milestoneTimestamp,
                dateFormatted: `${DateHelper.formatShort(transactionFirst.milestoneTimestamp * 1000)} (${ago})`,
                balanceChange: balanceChange,
                balanceChangeFormatted: (isSpent ? `-` : `+`) + formatAmount(Math.abs(balanceChange), tokenInfo, !isFormattedAmounts),
                outputs: transactions
            });
        });
        return calculatedTransactions;
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

