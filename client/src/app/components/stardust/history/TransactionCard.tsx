import classNames from "classnames";
import moment from "moment";
import React, { useContext } from "react";
import { ITransactionEntryProps } from "./TransactionEntryProps";
import { DateHelper } from "~helpers/dateHelper";
import { TransactionsHelper } from "~helpers/stardust/transactionsHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { CHRYSALIS_MAINNET } from "~models/config/networkType";
import NetworkContext from "../../../context/NetworkContext";
import TruncatedId from "../TruncatedId";

const TransactionCard: React.FC<ITransactionEntryProps> = (
    { outputId, transactionId, date, milestoneIndex, value, isSpent, isFormattedAmounts, setIsFormattedAmounts }
) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const ago = moment(date * 1000).fromNow();

    const valueView = (
        <span className="pointer margin-r-5" onClick={() => setIsFormattedAmounts(!isFormattedAmounts)} >
            {`${isSpent ? "-" : "+"} ${formatAmount(value, tokenInfo, !isFormattedAmounts)}`}
        </span>
    );

    const isTransactionFromStardustGenesis = milestoneIndex &&
        TransactionsHelper.isTransactionFromIotaStardustGenesis(network, milestoneIndex);
    const transactionLink = isTransactionFromStardustGenesis ?
        `/${CHRYSALIS_MAINNET}/search/${transactionId}` :
        `/${network}/transaction/${transactionId}`;

    return (
        <div className="card">
            <div className="field">
                <div className="card--label">
                    Transaction Id
                </div>
                <div className="row card--value">
                    <TruncatedId
                        id={transactionId}
                        link={transactionLink}
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

