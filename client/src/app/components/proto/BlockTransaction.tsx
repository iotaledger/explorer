import React from "react";
import Transaction from "./Transaction";

interface BlockTransactionProps {
    network: string;
    txId: string;
}

const BlockTransaction: React.FC<BlockTransactionProps> = ({ network, txId }) => (
    <div className="section">
        <div className="section--header">
            <div className="row middle">
                <h1>Transaction</h1>
            </div>
        </div>
        <Transaction network={network} txId={txId} />
    </div>
);

export default BlockTransaction;
