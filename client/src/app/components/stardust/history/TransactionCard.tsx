import classNames from "classnames";
import moment from "moment";
import React, { useContext } from "react";
import { DateHelper } from "../../../../helpers/dateHelper";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../../context/NetworkContext";
import TruncatedId from "../TruncatedId";
import { ITransactionEntryProps } from "./TransactionEntryProps";

const TransactionCard: React.FC<ITransactionEntryProps> = (
    { outputId, transactionId, date, value, isSpent, isFormattedAmounts, setIsFormattedAmounts }
) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const ago = moment(date * 1000).fromNow();

    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)} >
            {`${isSpent ? "-" : "+"} ${formatAmount(value, tokenInfo, !isFormattedAmounts)}`}
        </span>
    );

    return (
        <div className="card">
            <div className="field">
                <div className="card--label">
                    Transaction Id
                </div>
                <div className="row card--value">
                    <TruncatedId
                        id={transactionId}
                        link={`/${network}/transaction/${transactionId}`}
                    />
                </div>
            </div>
            <div className="field">
                <div className="card--label">
                    Output Id
                </div>
                <div className="row card--value">
                    <TruncatedId
                        id={outputId}
                        link={`/${network}/output/${outputId}`}
                    />
                </div>
            </div>
            <div className="field">
                <div className="card--label">
                    Date
                </div>
                <div className="card--value">
                    {`${DateHelper.formatShort(date * 1000)} (${ago})`}
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

