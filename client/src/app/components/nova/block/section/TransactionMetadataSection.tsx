import { TransactionMetadata } from "@iota/sdk-wasm-nova/web";
import React from "react";
import Spinner from "../../../Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";

interface TransactionMetadataSectionProps {
    readonly network: string;
    readonly metadata?: TransactionMetadata;
    readonly metadataError?: string;
    readonly isLinksDisabled: boolean;
}

const TransactionMetadataSection: React.FC<TransactionMetadataSectionProps> = (
    { network, metadata, metadataError, isLinksDisabled }
) => (
    <div className="section metadata-section">
        <div className="section--data">
            {!metadata && !metadataError && (<Spinner />)}
            {metadataError && (
                <p className="danger">Failed to retrieve metadata. {metadataError}</p>
            )}
            {metadata && !metadataError && (
                <React.Fragment>
                    <div className="section--data">
                        <div className="label">
                            Transaction Id
                        </div>
                        <div className="value code">
                            <TruncatedId 
                                id={metadata.transactionId} 
                                showCopyButton
                                link={isLinksDisabled ? undefined : `/${network}/transaction/${metadata.transactionId}`}
                            />
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Transaction Status
                        </div>
                        <div className="value row middle">
                            {metadata.transactionState}
                        </div>
                    </div>
                    {metadata.transactionFailureReason && (
                        <div className="section--data">
                            <div className="label">Failure Reason</div>
                            <div className="value">{metadata.transactionFailureReason}</div>
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    </div>
);

TransactionMetadataSection.defaultProps = {
    metadata: undefined,
    metadataError: undefined
};

export default TransactionMetadataSection;

