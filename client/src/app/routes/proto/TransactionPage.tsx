import React from "react";
import { RouteComponentProps } from "react-router-dom";
import "./TransactionPage.scss";
import Transaction from "../../components/proto/Transaction";

interface TransactionProps {
    network: string;
    txId: string;
}

const TransactionPage: React.FC<RouteComponentProps<TransactionProps>> = (
    { match: { params: { network, txId } } }
) => (
    <div className="block-page">
        <div className="wrapper">
            <div className="inner">
                <div className="transaction-page--header">
                    <div className="row row--tablet-responsive middle space-between middle">
                        <div className="row middle">
                            <h1>
                                Transaction
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="section">
                    <Transaction network={network} txId={txId} />
                </div>
            </div>
        </div>
    </div>
);

export default TransactionPage;
