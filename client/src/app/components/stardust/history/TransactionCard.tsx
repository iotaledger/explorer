import classNames from "classnames";
import React from "react";
import { ITransactionEntryProps } from "./TransactionHistoryTypes";
import TruncatedId from "../TruncatedId";
import Tooltip from "~app/components/Tooltip";

const TransactionCard: React.FC<ITransactionEntryProps> = (
    {
        isGenesisByDate,
        isTransactionFromStardustGenesis,
        transactionLink,
        dateFormatted,
        balanceChangeFormatted,
        transactionId,
        isSpent,
        isFormattedAmounts,
        setIsFormattedAmounts,
    }
) => {

    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)} >
            {balanceChangeFormatted}
        </span>
    );

    return (
        <div className="card">
            <div className="field">
                <div className="card--label">
                    Date
                </div>
                { isGenesisByDate ? (
                    <div className="card--value">
                        Genesis
                    </div>
                ) : (
                    <div className="card--value">
                        {dateFormatted}
                    </div>
                )}

            </div>
            <div className="field">
                <div className="card--label">
                    Transaction Id
                </div>
                <div className="row card--value">
                    <TruncatedId
                        id={transactionId}
                        link={transactionLink}
                    />
                    {isTransactionFromStardustGenesis && (
                        <Tooltip
                            tooltipContent="This link opens the transaction on Chrysalis Mainnet"
                            childrenClass="row middle"
                        >
                            <span className="material-icons" style={{ fontSize: "14px" }}>
                                warning
                            </span>
                        </Tooltip>
                    )}
                </div>
            </div>
            <div className="field">
                <div className="card--label">
                    Value
                </div>
                <div className={classNames("amount", "card--value", { "negative": isSpent })}>
                    {valueView}
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;

