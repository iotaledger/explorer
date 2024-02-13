import classNames from "classnames";
import React from "react";
import { ITransactionEntryProps } from "./TransactionEntryProps";
import TransactionIdView from "./TransactionIdView";

const TransactionCard: React.FC<ITransactionEntryProps> = ({
    isGenesisByDate,
    isTransactionFromStardustGenesis,
    transactionLink,
    dateFormatted,
    balanceChangeFormatted,
    transactionId,
    isSpent,
    isFormattedAmounts,
    setIsFormattedAmounts,
    stardustGenesisOutputId,
    stardustGenesisOutputLink,
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
                {isGenesisByDate ? <div className="card--value">Genesis</div> : <div className="card--value">{dateFormatted}</div>}
            </div>
            <div className="field">
                <div className="card--label">Transaction Id</div>
                <div className="row card--value">
                    <TransactionIdView
                        stardustGenesisOutputId={stardustGenesisOutputId}
                        stardustGenesisOutputLink={stardustGenesisOutputLink}
                        transactionId={transactionId}
                        isTransactionFromStardustGenesis={isTransactionFromStardustGenesis}
                        transactionLink={transactionLink}
                    />
                </div>
            </div>
            <div className="field">
                <div className="card--label">Value</div>
                <div className={classNames("amount", "card--value", { negative: isSpent })}>{valueView}</div>
            </div>
        </div>
    );
};

export default TransactionCard;
