import classNames from "classnames";
import React from "react";
import TruncatedId from "../../stardust/TruncatedId";
import { ITransactionHistoryEntryProps } from "./ITransactionHistoryEntryProps";

const TransactionHistoryCard: React.FC<ITransactionHistoryEntryProps> = ({
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
        <div className="card">
            <div className="field">
                <div className="card--label">Date</div>
                <div className="card--value">{dateFormatted}</div>
            </div>
            <div className="field">
                <div className="card--label">Transaction Id</div>
                <div className="row card--value">
                    <TruncatedId id={transactionId} link={transactionLink} />
                </div>
            </div>
            <div className="field">
                <div className="card--label">Value</div>
                <div className={classNames("amount", "card--value", { negative: isSpent })}>{valueView}</div>
            </div>
        </div>
    );
};

export default TransactionHistoryCard;
