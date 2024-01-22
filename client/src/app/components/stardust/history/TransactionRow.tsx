import classNames from "classnames";
import React from "react";
import { ITransactionEntryProps } from "./TransactionEntryProps";
import TransactionId from "./TransactionId";

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
}) => {
    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)}>
            {balanceChangeFormatted}
        </span>
    );

    return (
        <tr>
            {isGenesisByDate ? <td className="date">Genesis</td> : <td className="date">{dateFormatted}</td>}
            <td className="transaction-id">
                <div className="row center">
                    <TransactionId transactionId={transactionId} isTransactionFromStardustGenesis={isTransactionFromStardustGenesis} transactionLink={transactionLink} />
                </div>
            </td>
            <td className={classNames("amount", { negative: isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionRow;
