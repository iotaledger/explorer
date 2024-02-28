/* eslint-disable react/jsx-no-useless-fragment */
import { AccountAddress, BasicBlockBody, SignedTransactionPayload, Utils } from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import metadataInfoMessage from "~assets/modals/stardust/block/metadata.json";
import transactionPayloadMessage from "~assets/modals/stardust/transaction/main-header.json";
import { useBlockMetadata } from "~helpers/nova/hooks/useBlockMetadata";
import { useInputsAndOutputs } from "~helpers/nova/hooks/useInputsAndOutputs";
import { useTransactionIncludedBlock } from "~helpers/nova/hooks/useTransactionIncludedBlock";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import TabbedSection from "~/app/components/hoc/TabbedSection";
import Modal from "~/app/components/Modal";
import Spinner from "~/app/components/Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import NotFound from "~/app/components/NotFound";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { DateHelper } from "~/helpers/dateHelper";
import BlockTangleState from "~/app/components/nova/block/BlockTangleState";
import BlockPayloadSection from "~/app/components/nova/block/section/BlockPayloadSection";
import TransactionMetadataSection from "~/app/components/nova/block/section/TransactionMetadataSection";
import "./TransactionPage.scss";

export interface TransactionPageProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The transaction to lookup.
     */
    transactionId: string;
}

enum TRANSACTION_PAGE_TABS {
    Payload = "Payload",
    Metadata = "Metadata",
}

const TransactionPage: React.FC<RouteComponentProps<TransactionPageProps>> = ({
    history,
    match: {
        params: { network, transactionId },
    },
}) => {
    const { tokenInfo, protocolInfo, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [block, isIncludedBlockLoading, blockError] = useTransactionIncludedBlock(network, transactionId);
    const [inputs, outputs, transferTotal, isInputsAndOutputsLoading] = useInputsAndOutputs(network, block);
    const [blockId, setBlockId] = useState<string | null>(null);
    const [blockMetadata] = useBlockMetadata(network, blockId);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);

    useEffect(() => {
        if (block && protocolInfo) {
            setBlockId(Utils.blockId(block, protocolInfo?.parameters));
        }
    }, [block]);

    const tabbedSections: JSX.Element[] = [];
    let idx = 0;
    if (block) {
        tabbedSections.push(
            <BlockPayloadSection
                key={++idx}
                block={block}
                inputs={inputs ?? undefined}
                outputs={outputs ?? undefined}
                transferTotal={transferTotal ?? undefined}
            />,
        );
    }

    if (blockMetadata.metadata?.transactionMetadata) {
        tabbedSections.push(
            <TransactionMetadataSection
                key={++idx}
                transaction={((block?.body as BasicBlockBody)?.payload as SignedTransactionPayload)?.transaction}
                transactionMetadata={blockMetadata.metadata?.transactionMetadata}
            />,
        );
    }

    if (blockError) {
        return (
            <div className="transaction-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="transaction-page--header">
                            <div className="row middle">
                                <h1>Transaction</h1>
                                <Modal icon="info" data={transactionPayloadMessage} />
                                {isIncludedBlockLoading && <Spinner />}
                            </div>
                            <NotFound searchTarget="transaction" query={transactionId} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const transactionContent = block ? (
        <React.Fragment>
            <div className="section--header row row--tablet-responsive middle space-between">
                <div className="row middle">
                    <h2>General</h2>
                </div>
            </div>
            <div className="section--data">
                <div className="label">Transaction ID</div>
                <div className="value code">
                    <TruncatedId id={transactionId} showCopyButton />
                </div>
            </div>
            {blockId && (
                <div className="section--data">
                    <div className="label">Included in block</div>
                    <div className="value code highlight">
                        <TruncatedId id={blockId} link={`/${network}/block/${blockId}`} showCopyButton />
                    </div>
                </div>
            )}
            <div className="section--data">
                <div className="label">Issuing Time</div>
                <div className="value code">{DateHelper.formatShort(Number(block.header.issuingTime) / 1000000)}</div>
            </div>
            <div className="section--data">
                <div className="label">Slot commitment</div>
                <div className="value code">
                    <TruncatedId id={block.header.slotCommitmentId} />
                </div>
            </div>
            <div className="section--data">
                <div className="label">Issuer</div>
                <div className="value code highlight">
                    <TruncatedId
                        id={block.header.issuerId}
                        link={`/${network}/addr/${Utils.addressToBech32(new AccountAddress(block.header.issuerId), bech32Hrp)}`}
                        showCopyButton={true}
                    />
                </div>
            </div>
            {transferTotal !== null && (
                <div className="section--data">
                    <div className="label">Amount transacted</div>
                    <div className="amount-transacted value row middle">
                        <span onClick={() => setIsFormattedBalance(!isFormattedBalance)} className="pointer margin-r-5">
                            {formatAmount(transferTotal, tokenInfo, !isFormattedBalance)}
                        </span>
                    </div>
                </div>
            )}
            <TabbedSection
                tabsEnum={TRANSACTION_PAGE_TABS}
                tabOptions={{
                    [TRANSACTION_PAGE_TABS.Payload]: {
                        disabled: !inputs || !outputs,
                        isLoading: isInputsAndOutputsLoading,
                        infoContent: transactionPayloadMessage,
                    },
                    [TRANSACTION_PAGE_TABS.Metadata]: {
                        infoContent: metadataInfoMessage,
                    },
                }}
            >
                {tabbedSections}
            </TabbedSection>
        </React.Fragment>
    ) : null;

    return (
        <div className="transaction-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="transaction-page--header">
                        <div className="row--tablet-responsive middle">
                            <div className="row middle">
                                <h1>Transaction</h1>
                                <Modal icon="info" data={transactionPayloadMessage} />
                                {isIncludedBlockLoading && <Spinner />}
                            </div>
                            {blockMetadata.metadata && block?.header && (
                                <BlockTangleState
                                    status={blockMetadata.metadata?.blockState}
                                    issuingTime={block?.header.issuingTime}
                                    failureReason={blockMetadata.metadata?.blockFailureReason}
                                />
                            )}
                        </div>
                    </div>
                    <div className="section">{transactionContent}</div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;
