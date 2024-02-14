import classNames from "classnames";
import React from "react";
import { ITransactionEntryProps } from "./TransactionEntryProps";
import TransactionIdView from "./TransactionIdView";

const TransactionRow: React.FC<ITransactionEntryProps> = ({
    isGenesisByDate,
    isTransactionFromStardustGenesis,
    transactionLink,
    dateFormatted,
    balanceChangeFormatted,
    transactionId,
    isSpent,
    isFormattedAmounts,
    setIsFormattedAmounts,
    isExpired,
}) => {
    const valueView = (
        <span className="pointer" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)}>
            {balanceChangeFormatted}
        </span>
    );

    return (
        <tr>
            {isGenesisByDate ? <td className="date">Genesis</td> : <td className="date">{dateFormatted}</td>}
            <td className="transaction-id">
                <div className="row center">
                    <TransactionIdView
                        transactionId={transactionId}
                        isTransactionFromStardustGenesis={isTransactionFromStardustGenesis}
                        transactionLink={transactionLink}
                        isTxExpired={isExpired}
                    />
                </div>
            </td>
            <td className={classNames("amount", { negative: isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionRow;
