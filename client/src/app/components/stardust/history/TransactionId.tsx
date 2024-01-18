import React, { useContext } from "react";
import NetworkContext from "~/app/context/NetworkContext";
import { STARDUST_SUPPLY_INCREASE_TRANSACTION_ID, TransactionsHelper } from "~/helpers/stardust/transactionsHelper";
import { CHRYSALIS_MAINNET } from "~/models/config/networkType";
import TruncatedId from "../TruncatedId";
import Tooltip from "../../Tooltip";

export interface ITransactionIdProps {
    transactionId: string;
    milestoneIndex: number;
}

const TransactionId: React.FC<ITransactionIdProps> = ({ milestoneIndex, transactionId }) => {
    const { name: network } = useContext(NetworkContext);

    const isTransactionFromStardustGenesis =
        milestoneIndex && TransactionsHelper.isTransactionFromIotaStardustGenesis(network, milestoneIndex);

    const transactionLink =
        isTransactionFromStardustGenesis && !transactionId.includes(STARDUST_SUPPLY_INCREASE_TRANSACTION_ID)
            ? `/${CHRYSALIS_MAINNET}/search/${transactionId}`
            : `/${network}/transaction/${transactionId}`;

    return (
        <>
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
        </>
    );
};

export default TransactionId;
