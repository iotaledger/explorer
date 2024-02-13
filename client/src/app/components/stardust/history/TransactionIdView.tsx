import React from "react";
import { STARDUST_SUPPLY_INCREASE_TRANSACTION_ID } from "~/helpers/stardust/transactionsHelper";
import TruncatedId from "../TruncatedId";
import Tooltip from "../../Tooltip";
import { Link } from "react-router-dom";

export interface ITransactionIdProps {
    transactionId: string;
    isTransactionFromStardustGenesis: boolean;
    transactionLink: string;
}

const TransactionIdView: React.FC<ITransactionIdProps> = ({ transactionId, isTransactionFromStardustGenesis, transactionLink }) => {
    return (
        <>
            <Link to={transactionLink} className="row center margin-r-t">
                {isTransactionFromStardustGenesis && transactionId.includes(STARDUST_SUPPLY_INCREASE_TRANSACTION_ID) ? (
                    <span>Stardust Genesis</span>
                ) : (
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
                )}
            </Link>
        </>
    );
};

export default TransactionIdView;
