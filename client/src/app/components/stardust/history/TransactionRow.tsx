import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import Tooltip from "../../Tooltip";
import TruncatedId from "../TruncatedId";
import { ITransactionEntryProps } from "./TransactionEntryProps";

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
        <span className="pointer" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)}>
            {balanceChangeFormatted}
        </span>
    );

    return (
        <tr>
            {isGenesisByDate ? <td className="date">Genesis</td> : <td className="date">{dateFormatted}</td>}
            <td className="transaction-id">
                <Link to={transactionLink} className="row center margin-r-t">
                    <TruncatedId id={transactionId} />
                    {isTransactionFromStardustGenesis && (
                        <Tooltip tooltipContent="This link opens the transaction on Chrysalis Mainnet" childrenClass="row middle">
                            <span className="material-icons" style={{ fontSize: "14px" }}>
                                warning
                            </span>
                        </Tooltip>
                    )}
                </Link>
            </td>
            <td className={classNames("amount", { negative: isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionRow;
