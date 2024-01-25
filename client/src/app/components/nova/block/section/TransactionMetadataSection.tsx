import classNames from "classnames";
import { TRANSACTION_FAILURE_REASON_STRINGS, Transaction, TransactionMetadata } from "@iota/sdk-wasm-nova/web";
import React from "react";
import "./TransactionMetadataSection.scss";
import Spinner from "../../../Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import ContextInputView from "../../ContextInputView";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface TransactionMetadataSectionProps {
    readonly transaction?: Transaction;
    readonly transactionMetadata?: TransactionMetadata;
    readonly metadataError?: string;
}

const TransactionMetadataSection: React.FC<TransactionMetadataSectionProps> = ({ transaction, transactionMetadata, metadataError }) => {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);

    return (
        <div className="section metadata-section">
            <div className="section--data">
                {!transactionMetadata && !metadataError && <Spinner />}
                {metadataError ? (
                    <p className="danger">Failed to retrieve metadata. {metadataError}</p>
                ) : (
                    <React.Fragment>
                        {transactionMetadata && (
                            <>
                                <div className="section--data">
                                    <div className="label">Transaction Status</div>
                                    <div className="value row middle capitalize-text">
                                        <div
                                            className={classNames(
                                                "transaction-tangle-state",
                                                {
                                                    "transaction-tangle-state__confirmed":
                                                        transactionMetadata.transactionState === "accepted" || "confirmed" || "finalized",
                                                },
                                                {
                                                    "transaction-tangle-state__conflicting":
                                                        transactionMetadata.transactionState === "failed",
                                                },
                                                { "transaction-tangle-state__pending": transactionMetadata.transactionState === "pending" },
                                            )}
                                        >
                                            {transactionMetadata.transactionState}
                                        </div>
                                    </div>
                                </div>
                                {transactionMetadata.transactionFailureReason && (
                                    <div className="section--data">
                                        <div className="label">Failure Reason</div>
                                        <div className="value">
                                            {TRANSACTION_FAILURE_REASON_STRINGS[transactionMetadata.transactionFailureReason]}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {transaction && (
                            <>
                                <div className="section--data">
                                    <div className="label">Creation slot</div>
                                    <div className="value code">{transaction.creationSlot}</div>
                                </div>
                                {transaction?.contextInputs?.map((contextInput, idx) => (
                                    <ContextInputView contextInput={contextInput} key={idx} />
                                ))}
                                {transaction?.allotments && (
                                    <div className="section--data">
                                        <div className="label">Mana Allotment Accounts</div>
                                        {transaction?.allotments?.map((allotment, idx) => (
                                            <div className="value code highlight margin-b-t" key={idx}>
                                                <TruncatedId
                                                    id={allotment.accountId}
                                                    link={`/${network}/account/${allotment.accountId}`}
                                                    showCopyButton
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

TransactionMetadataSection.defaultProps = {
    transactionMetadata: undefined,
    transaction: undefined,
    metadataError: undefined,
};

export default TransactionMetadataSection;
