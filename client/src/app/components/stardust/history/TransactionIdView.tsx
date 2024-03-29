import React from "react";
import { Link } from "react-router-dom";
import { STARDUST_SUPPLY_INCREASE_OUTPUT_TICKER } from "~/helpers/stardust/transactionsHelper";
import TruncatedId from "../TruncatedId";
import Tooltip from "../../Tooltip";

export interface ITransactionIdProps {
    transactionId: string;
    isTransactionFromStardustGenesis: boolean;
    transactionLink: string;
}

const TransactionIdView: React.FC<ITransactionIdProps> = ({ transactionId, isTransactionFromStardustGenesis, transactionLink }) => {
    if (isTransactionFromStardustGenesis && transactionId.includes(STARDUST_SUPPLY_INCREASE_OUTPUT_TICKER)) {
        return (
            <Link to={transactionLink}>
                <span>Supply Increase</span>
            </Link>
        );
    }

    return (
        <>
            <TruncatedId id={transactionId} link={transactionLink} />
            {isTransactionFromStardustGenesis && (
                <Tooltip tooltipContent="This link opens the transaction on Chrysalis Mainnet" childrenClass="row middle">
                    <span className="material-icons" style={{ fontSize: "14px" }}>
                        warning
                    </span>
                </Tooltip>
            )}
        </>
    );
};

export default TransactionIdView;
