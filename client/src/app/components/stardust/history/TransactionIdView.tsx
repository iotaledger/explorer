import React from "react";
import { STARDUST_SUPPLY_INCREASE_TRANSACTION_ID } from "~/helpers/stardust/transactionsHelper";
import TruncatedId from "../TruncatedId";
import Tooltip from "../../Tooltip";

export interface ITransactionIdProps {
    transactionId: string;
    isTransactionFromStardustGenesis: boolean;
    stardustGenesisOutputId?: string;
    stardustGenesisOutputLink?: string;
    transactionLink: string;
}

const TransactionIdView: React.FC<ITransactionIdProps> = ({
    transactionId,
    isTransactionFromStardustGenesis,
    transactionLink,
    stardustGenesisOutputId,
    stardustGenesisOutputLink,
}) => {
    if (isTransactionFromStardustGenesis && transactionId.includes(STARDUST_SUPPLY_INCREASE_TRANSACTION_ID)) {
        return <span>Stardust Genesis</span>;
    }

    const truncateParams = React.useMemo(() => {
        if (isTransactionFromStardustGenesis) {
            return {
                id: stardustGenesisOutputId as string,
                link: stardustGenesisOutputLink as string,
            };
        }
        return {
            id: transactionId,
            link: transactionLink,
        };
    }, [isTransactionFromStardustGenesis, transactionId, transactionLink, stardustGenesisOutputId, stardustGenesisOutputLink]);

    return (
        <>
            <TruncatedId id={truncateParams.id} link={truncateParams.link} />
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
