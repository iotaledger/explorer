import { Transaction, TransactionMetadata } from "@iota/sdk-wasm-nova/web";
import React from "react";
import Spinner from "../../../Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import ContextInputView from "../../ContextInputView";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";

interface TransactionMetadataSectionProps {
    readonly network: string;
    readonly transaction?: Transaction;
    readonly transactionMetadata?: TransactionMetadata;
    readonly metadataError?: string;
}

const TransactionMetadataSection: React.FC<TransactionMetadataSectionProps> = ({
    network,
    transaction,
    transactionMetadata,
    metadataError,
}) => {
    const { networkInfo } = useNetworkInfoNova();

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
                                    <div className="value row middle">{transactionMetadata.transactionState}</div>
                                </div>
                                {transactionMetadata.transactionFailureReason && (
                                    <div className="section--data">
                                        <div className="label">Failure Reason</div>
                                        <div className="value">{transactionMetadata.transactionFailureReason}</div>
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
                                {transaction?.contextInputs?.map((contxtInput, idx) => (
                                    <ContextInputView contextInput={contxtInput} key={idx} />
                                ))}
                                {transaction?.allotments && (
                                    <div className="section--data">
                                        <div className="label">Mana Allotment Accounts</div>
                                        {transaction?.allotments?.map((allotment, idx) => (
                                            <div className="value code highlight margin-b-t" key={idx}>
                                                <TruncatedId
                                                    id={allotment.accountId}
                                                    link={`/${networkInfo.name}/account/${allotment.accountId}`}
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
