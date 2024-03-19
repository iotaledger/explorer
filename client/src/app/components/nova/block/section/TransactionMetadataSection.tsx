import {
    TRANSACTION_FAILURE_REASON_STRINGS,
    Transaction,
    TransactionMetadataResponse as TransactionMetadata,
    TransactionState,
    Utils,
    AccountAddress,
} from "@iota/sdk-wasm-nova/web";
import React from "react";
import Spinner from "../../../Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import ContextInputView from "../../ContextInputView";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { PillStatus } from "~/app/lib/ui/enums";
import StatusPill from "~/app/components/nova/StatusPill";

interface TransactionMetadataSectionProps {
    readonly transaction?: Transaction;
    readonly transactionMetadata?: TransactionMetadata;
    readonly metadataError?: string;
}

const TRANSACTION_STATE_TO_PILL_STATUS: Record<TransactionState, PillStatus> = {
    pending: PillStatus.Pending,
    accepted: PillStatus.Success,
    committed: PillStatus.Success,
    finalized: PillStatus.Success,
    failed: PillStatus.Error,
};

const TransactionMetadataSection: React.FC<TransactionMetadataSectionProps> = ({ transaction, transactionMetadata, metadataError }) => {
    const { name: network, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const pillStatus: PillStatus | undefined = TRANSACTION_STATE_TO_PILL_STATUS[transactionMetadata?.transactionState ?? "pending"];

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
                                    <div className="value row middle">
                                        <StatusPill status={pillStatus} label={transactionMetadata.transactionState} />
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
                                    <div className="label">Transaction creation slot</div>
                                    <div className="value code">{transaction.creationSlot}</div>
                                </div>
                                {transaction?.contextInputs?.map((contextInput, idx) => (
                                    <ContextInputView contextInput={contextInput} key={idx} />
                                ))}
                                {transaction?.allotments && (
                                    <div className="section--data">
                                        <div className="label">Mana Allotment Accounts</div>
                                        {transaction?.allotments?.map((allotment, idx) => {
                                            const accountAddress = new AccountAddress(allotment.accountId);
                                            const accountBech32 = Utils.addressToBech32(accountAddress, bech32Hrp);

                                            return (
                                                <div className="value code highlight margin-b-t" key={idx}>
                                                    <TruncatedId
                                                        id={allotment.accountId}
                                                        link={`/${network}/addr/${accountBech32}`}
                                                        showCopyButton
                                                    />
                                                </div>
                                            );
                                        })}
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
