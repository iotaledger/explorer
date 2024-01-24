import React from "react";
import { STARDUST_SUPPLY_INCREASE_TRANSACTION_ID } from "~/helpers/stardust/transactionsHelper";
import TruncatedId from "../TruncatedId";
import Tooltip from "../../Tooltip";

export interface ITransactionIdProps {
    transactionId: string;
    isTransactionFromStardustGenesis: boolean;
    transactionLink: string;
    isTxExpired?: boolean;
}

interface ITxIndicator {
    icon: string;
    message: string;
    condition?: boolean;
}

const TX_EXPIRED_MESSAGE = "Transaction has expired.";
const CHRYSALIS_TX_MESSAGE = "This link opens the transaction on Chrysalis Mainnet";

const TransactionIdView: React.FC<ITransactionIdProps> = ({
    transactionId,
    isTransactionFromStardustGenesis,
    transactionLink,
    isTxExpired,
}) => {
    const indicators: ITxIndicator[] = [
        {
            icon: "warning",
            message: CHRYSALIS_TX_MESSAGE,
            condition: isTransactionFromStardustGenesis,
        },
        {
            icon: "hourglass_bottom",
            message: TX_EXPIRED_MESSAGE,
            condition: isTxExpired,
        },
    ];

    return (
        <>
            {isTransactionFromStardustGenesis && transactionId.includes(STARDUST_SUPPLY_INCREASE_TRANSACTION_ID) ? (
                <span>Stardust Genesis</span>
            ) : (
                <>
                    <TruncatedId id={transactionId} link={transactionLink} />
                    {indicators.length > 0 && (
                        <div className="transaction-indicators">
                            {indicators.map(
                                ({ icon, message, condition }, index) =>
                                    condition && (
                                        <Tooltip key={index} tooltipContent={message} childrenClass="row middle">
                                            <span className="material-icons tx-indicator">{icon}</span>
                                        </Tooltip>
                                    ),
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default TransactionIdView;
