import classNames from "classnames";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../context/NetworkContext";
import { ITransactionEntryProps } from "./TransactionEntryProps";

const TransactionRow: React.FC<ITransactionEntryProps> = (
    { transactionId, date, value, isSpent, isFormattedAmounts, setIsFormattedAmounts }
) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);

    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)} >
            {`${isSpent ? "-" : "+"} ${formatAmount(value, tokenInfo, !isFormattedAmounts)}`}
        </span>
    );

    return (
        <tr>
            <td className="block-id">
                <Link to={`/${network}/transaction/${transactionId}`} className="margin-r-t">
                    {transactionId}
                </Link>
            </td>
            <td className="date">{DateHelper.formatShort(date * 1000)}</td>
            <td className={classNames("amount", { "negative": isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionRow;

