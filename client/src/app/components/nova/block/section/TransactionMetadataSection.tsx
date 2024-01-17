import classNames from "classnames";
import { TRANSACTION_FAILURE_REASON_STRINGS, TransactionMetadata } from "@iota/sdk-wasm-nova/web";
import React from "react";
import "./TransactionMetadataSection.scss";
import Spinner from "../../../Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";

interface TransactionMetadataSectionProps {
    readonly network: string;
    readonly metadata?: TransactionMetadata;
    readonly metadataError?: string;
    readonly isLinksDisabled: boolean;
}

const TransactionMetadataSection: React.FC<TransactionMetadataSectionProps> = ({ network, metadata, metadataError, isLinksDisabled }) => (
    <div className="section metadata-section">
        <div className="section--data">
            {!metadata && !metadataError && <Spinner />}
            {metadataError && <p className="danger">Failed to retrieve metadata. {metadataError}</p>}
            {metadata && !metadataError && (
                <React.Fragment>
                    <div className="section--data">
                        <div className="label">Transaction Id</div>
                        <div className="value code">
                            <TruncatedId
                                id={metadata.transactionId}
                                showCopyButton
                                link={isLinksDisabled ? undefined : `/${network}/transaction/${metadata.transactionId}`}
                            />
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Transaction Status</div>
                        <div className="value row middle capitalize-text">
                            <div
                                className={classNames(
                                    "transaction-tangle-state",
                                    {
                                        "transaction-tangle-state__confirmed":
                                            metadata.transactionState === "accepted" || "confirmed" || "finalized",
                                    },
                                    {
                                        "transaction-tangle-state__conflicting": metadata.transactionState === "failed",
                                    },
                                    { "transaction-tangle-state__pending": metadata.transactionState === "pending" },
                                )}
                            >
                                {metadata.transactionState}
                            </div>
                        </div>
                    </div>
                    {metadata.transactionFailureReason && (
                        <div className="section--data">
                            <div className="label">Failure Reason</div>
                            <div className="value">{TRANSACTION_FAILURE_REASON_STRINGS[metadata.transactionFailureReason]}</div>
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    </div>
);

TransactionMetadataSection.defaultProps = {
    metadata: undefined,
    metadataError: undefined,
};

export default TransactionMetadataSection;
