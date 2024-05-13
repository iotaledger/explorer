import classNames from "classnames";
import React from "react";
import TruncatedId from "../../stardust/TruncatedId";
import { ITransactionHistoryEntryProps } from "./ITransactionHistoryEntryProps";

const TransactionHistoryRow: React.FC<ITransactionHistoryEntryProps> = ({
    transactionLink,
    dateFormatted,
    balanceChangeFormatted,
    transactionId,
    isSpent,
    isFormattedAmounts,
    setIsFormattedAmounts,
}) => {
    const valueView = (
        <span className="pointer" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)}>
            {balanceChangeFormatted}
        </span>
    );

    return (
        <tr>
            <td className="date">{dateFormatted}</td>
            <td className="transaction-id">
                <div className="row center">
                    <TruncatedId id={transactionId} link={transactionLink} />
                </div>
            </td>
            <td className={classNames("amount", { negative: isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionHistoryRow;
