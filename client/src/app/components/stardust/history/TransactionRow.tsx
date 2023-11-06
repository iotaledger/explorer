import classNames from "classnames";
import moment from "moment";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ITransactionEntryProps } from "./TransactionEntryProps";
import { DateHelper } from "../../../../helpers/dateHelper";
import { TransactionsHelper } from "../../../../helpers/stardust/transactionsHelper";
import { formatAmount } from "../../../../helpers/stardust/valueFormatHelper";
import { CHRYSALIS_MAINNET } from "../../../../models/config/networkType";
import NetworkContext from "../../../context/NetworkContext";
import Tooltip from "../../Tooltip";
import TruncatedId from "../TruncatedId";

const TransactionRow: React.FC<ITransactionEntryProps> = (
    {
        outputId,
        transactionId,
        date,
        milestoneIndex,
        value,
        isSpent,
        isFormattedAmounts,
        setIsFormattedAmounts,
        darkBackgroundRow
    }
) => {
    const { name: network, tokenInfo } = useContext(NetworkContext);
    const outputIdTransaction = outputId.slice(0, -4);
    const outputIdIndex = outputId.slice(-4);
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
        <tr className={darkBackgroundRow ? "dark" : ""}>
            <td className="transaction-id">
                <Link to={transactionLink} className="row center margin-r-t">
                    <TruncatedId id={transactionId} />
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
                </Link>
            </td>
            <td className="row center output-id">
                <Link to={`/${network}/output/${outputId}`}>
                    <TruncatedId id={outputIdTransaction} />
                </Link>
                <span className="highlight">{outputIdIndex}</span>
            </td>
            {date === 0 ? (
                <td className="date">Genesis</td>
            ) : (
                <td className="date">{`${DateHelper.formatShort(date * 1000)} (${ago})`}</td>
            )}
            <td className={classNames("amount", { "negative": isSpent })}>{valueView}</td>
        </tr>
    );
};

export default TransactionRow;

