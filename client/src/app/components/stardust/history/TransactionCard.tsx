import classNames from "classnames";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { DateHelper } from "../../../../helpers/dateHelper";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../context/NetworkContext";
import { ITransactionEntryProps } from "./TransactionEntryProps";

const TransactionCard: React.FC<ITransactionEntryProps> = (
    { transactionId, date, value, isSpent, isFormattedAmounts, setIsFormattedAmounts }
) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);

    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)} >
            {`${isSpent ? "-" : "+"} ${formatAmount(value, tokenInfo, !isFormattedAmounts)}`}
        </span>
    );

    return (
        <div className="card">
            <div className="field">
                <div className="label">
                    Transaction Id
                </div>
                <div className="card--value">
                    <Link to={`/${network}/transaction/${transactionId}`} className="margin-r-t">
                        {transactionId}
                    </Link>
                </div>
            </div>
            <div className="field">
                <div className="label">
                    Date
                </div>
                <div className="card--value">
                    {DateHelper.formatShort(date * 1000)}
                </div>
            </div>
            <div className="field">
                <div className="label">
                    Value
                </div>
                <div className={classNames("amount", "card--value", { "negative": isSpent })}>
                    <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)} >
                        {valueView}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;

