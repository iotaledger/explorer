import classNames from "classnames";
import moment from "moment";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ITransactionEntryProps } from "./TransactionEntryProps";
import { DateHelper } from "~helpers/dateHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../context/NetworkContext";
import TruncatedId from "../TruncatedId";
import TransactionId from "./TransactionId";

const TransactionRow: React.FC<ITransactionEntryProps> = ({
    outputId,
    transactionId,
    date,
    milestoneIndex,
    value,
    isSpent,
    isFormattedAmounts,
    setIsFormattedAmounts,
    darkBackgroundRow,
}) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const outputIdTransaction = outputId.slice(0, -4);
    const outputIdIndex = outputId.slice(-4);
    const ago = moment(date * 1000).fromNow();

    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)}>
            {`${isSpent ? "-" : "+"} ${formatAmount(value, tokenInfo, !isFormattedAmounts)}`}
        </span>
    );

    return (
        <tr className={darkBackgroundRow ? "dark" : ""}>
            <td className="transaction-id">
                <div className="row center">
                    <TransactionId milestoneIndex={milestoneIndex} transactionId={transactionId} />
                </div>
            </td>
            <td className="row center output-id">
                <Link to={`/${network}/output/${outputId}`}>
                    <TruncatedId id={outputIdTransaction} />
                </Link>
                <span className="highlight">{outputIdIndex}</span>
            </td>
            {date === 0 ? <td className="date">Genesis</td> : <td className="date">{`${DateHelper.formatShort(date * 1000)} (${ago})`}</td>}
            <td className={classNames("amount", { negative: isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionRow;
