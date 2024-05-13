import { MilestonePayload, PayloadType, TransactionPayload, Utils } from "@iota/sdk-wasm-stardust/web";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { BlockProps } from "./BlockProps";
import mainHeaderMessage from "~assets/modals/stardust/block/main-header.json";
import metadataInfo from "~assets/modals/stardust/block/metadata.json";
import milestonePayloadInfo from "~assets/modals/stardust/block/milestone-payload.json";
import referencedBlocksInfo from "~assets/modals/stardust/block/milestone-referenced-blocks.json";
import taggedDataPayloadInfo from "~assets/modals/stardust/block/tagged-data-payload.json";
import transactionPayloadInfo from "~assets/modals/stardust/block/transaction-payload.json";
import { useBlock } from "~helpers/stardust/hooks/useBlock";
import { useBlockChildren } from "~helpers/stardust/hooks/useBlockChildren";
import { useBlockMetadata } from "~helpers/stardust/hooks/useBlockMetadata";
import { useInputsAndOutputs } from "~helpers/stardust/hooks/useInputsAndOutputs";
import { useMilestoneReferencedBlocks } from "~helpers/stardust/hooks/useMilestoneReferencedBlock";
import { isMarketedNetwork } from "~helpers/networkHelper";
import { NameHelper } from "~helpers/stardust/nameHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/block/BlockTangleState";
import MilestoneControls from "../../components/stardust/block/MilestoneControls";
import BlockMetadataSection from "../../components/stardust/block/section/BlockMetadataSection";
import BlockPayloadSection from "../../components/stardust/block/section/BlockPayloadSection";
import ReferencedBlocksSection from "../../components/stardust/block/section/referenced-blocks/ReferencedBlocksSection";
import TruncatedId from "../../components/stardust/TruncatedId";
import NetworkContext from "../../context/NetworkContext";
import "./Block.scss";

const Block: React.FC<RouteComponentProps<BlockProps>> = ({
    history,
    match: {
        params: { network, blockId },
    },
}) => {
    const { tokenInfo, protocolVersion } = useContext(NetworkContext);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const [transactionId, setTransactionId] = useState<string>();
    const [milestoneId, setMilestoneId] = useState<string | null>(null);
    const [block, isBlockLoading, blockError] = useBlock(network, blockId);
    const [blockChildren] = useBlockChildren(network, blockId);
    const [blockMetadata, isBlockMetadataLoading] = useBlockMetadata(network, blockId);
    const [inputs, unlocks, outputs, transferTotal, isInputsAndOutputsLoading] = useInputsAndOutputs(network, block);
    const [milestoneReferencedBlocks, isMilestoneReferencedBlockLoading] = useMilestoneReferencedBlocks(network, milestoneId);

    useEffect(() => {
        if (block?.payload?.type === PayloadType.Transaction) {
            const tsxId = Utils.transactionId(block.payload as TransactionPayload);
            setTransactionId(tsxId);
        }
        if (block?.payload?.type === PayloadType.Milestone) {
            const mId = Utils.milestoneId(block.payload as MilestonePayload);
            setMilestoneId(mId);
        }
    }, [block]);

    const { metadata, metadataError, conflictReason, blockTangleStatus } = blockMetadata;

    const isMarketed = isMarketedNetwork(network);
    const isMilestoneBlock = block?.payload?.type === PayloadType.Milestone;
    const isTransactionBlock = block?.payload?.type === PayloadType.Transaction;
    const isLinksDisabled = metadata?.ledgerInclusionState === "conflicting";
    const isLoading = isBlockLoading || isInputsAndOutputsLoading || isBlockMetadataLoading || isMilestoneReferencedBlockLoading;
    const milestoneIndex = isMilestoneBlock ? (block?.payload as MilestonePayload).index : undefined;
    let pageTitle = "Block";
    switch (block?.payload?.type) {
        case PayloadType.Milestone: {
            pageTitle = `Milestone Block ${milestoneIndex}`;
            break;
        }
        case PayloadType.Transaction: {
            pageTitle = "Transaction Block";
            break;
        }
        case PayloadType.TaggedData: {
            pageTitle = "Data Block";
            break;
        }
        default: {
            break;
        }
    }

    if (blockError) {
        return (
            <div className="block">
                <div className="wrapper">
                    <div className="inner">
                        <div className="block--header">
                            <div className="row middle">
                                <h1>{pageTitle}</h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                            </div>
                        </div>
                        <NotFound searchTarget="block" query={blockId} />
                    </div>
                </div>
            </div>
        );
    }

    const tabbedSections = [];
    let idx = 0;
    if (block) {
        tabbedSections.push(
            <BlockPayloadSection
                key={++idx}
                network={network}
                protocolVersion={protocolVersion}
                block={block}
                inputs={inputs ?? undefined}
                unlocks={unlocks ?? undefined}
                outputs={outputs ?? undefined}
                transferTotal={transferTotal ?? undefined}
                history={history}
                isLinksDisabled={isLinksDisabled}
            />,
        );
        tabbedSections.push(
            <BlockMetadataSection
                key={++idx}
                network={network}
                metadata={metadata}
                metadataError={metadataError}
                blockChildren={blockChildren}
                conflictReason={conflictReason}
                isLinksDisabled={isLinksDisabled}
            />,
        );
    }
    if (isMilestoneBlock) {
        tabbedSections.push(<ReferencedBlocksSection key={++idx} blockIds={milestoneReferencedBlocks ?? undefined} />);
    }

    const blockContent = block ? (
        <React.Fragment>
            <div className="section--header row row--tablet-responsive middle space-between">
                <div className="row middle">
                    <h2>General</h2>
                </div>
            </div>
            <div className="section--data">
                <div className="label">Block ID</div>
                <div className="value code">
                    <TruncatedId id={blockId} showCopyButton />
                </div>
            </div>
            {milestoneId && (
                <div className="section--data">
                    <div className="label">Milestone ID</div>
                    <div className="value code">
                        <TruncatedId id={milestoneId} showCopyButton />
                    </div>
                </div>
            )}
            {transactionId && (
                <div className="section--data">
                    <div className="label">Transaction Id</div>
                    <div className="value value__secondary row middle">
                        <TruncatedId
                            id={transactionId}
                            link={isLinksDisabled ? undefined : `/${network}/transaction/${transactionId}`}
                            showCopyButton
                        />
                    </div>
                </div>
            )}
            <div className="section--data">
                <div className="label">Payload Type</div>
                <div className="value row middle">{NameHelper.getPayloadType(block)}</div>
            </div>
            {!isMilestoneBlock && (
                <div className="section--data">
                    <div className="label">Nonce</div>
                    <div className="value row middle">
                        <span className="margin-r-t">{block?.nonce}</span>
                    </div>
                </div>
            )}
            {block?.payload?.type === PayloadType.Transaction && transferTotal !== null && (
                <div className="section--data">
                    <div className="label">Amount transacted</div>
                    <div className="amount-transacted value row middle">
                        <span onClick={() => setIsFormattedBalance(!isFormattedBalance)} className="pointer margin-r-5">
                            {formatAmount(transferTotal, tokenInfo, !isFormattedBalance)}
                        </span>
                        {isMarketed && (
                            <React.Fragment>
                                <span>(</span>
                                <FiatValue value={transferTotal} />
                                <span>)</span>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            )}
            <TabbedSection
                key={blockId}
                tabsEnum={
                    isMilestoneBlock
                        ? { Payload: "Milestone Payload", Metadata: "Metadata", RefBlocks: "Referenced Blocks" }
                        : isTransactionBlock
                          ? { Payload: "Transaction Payload", Metadata: "Metadata" }
                          : { Payload: "Tagged Data Payload", Metadata: "Metadata" }
                }
                tabOptions={
                    isMilestoneBlock
                        ? {
                              "Milestone Payload": { disabled: !block?.payload, infoContent: milestonePayloadInfo },
                              Metadata: { infoContent: metadataInfo },
                              "Referenced Blocks": {
                                  disabled: !milestoneReferencedBlocks,
                                  counter: milestoneReferencedBlocks?.length ?? undefined,
                                  infoContent: referencedBlocksInfo,
                              },
                          }
                        : isTransactionBlock
                          ? {
                                "Transaction Payload": {
                                    disabled: !block?.payload,
                                    infoContent: transactionPayloadInfo,
                                },
                                Metadata: { infoContent: metadataInfo },
                            }
                          : {
                                "Tagged Data Payload": {
                                    disabled: !block?.payload,
                                    infoContent: taggedDataPayloadInfo,
                                },
                                Metadata: { infoContent: metadataInfo },
                            }
                }
            >
                {tabbedSections}
            </TabbedSection>
        </React.Fragment>
    ) : null;

    return (
        <div className="block">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header">
                        <div className="header--wrapper">
                            <div className="row middle">
                                <h1>{pageTitle}</h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                                {isLoading && <Spinner />}
                            </div>
                            <BlockTangleState
                                network={network}
                                status={blockTangleStatus}
                                milestoneIndex={metadata?.referencedByMilestoneIndex}
                                hasConflicts={isLinksDisabled}
                                conflictReason={conflictReason}
                                onClick={
                                    metadata?.referencedByMilestoneIndex
                                        ? (theBlockId: string) => history.push(`/${network}/block/${theBlockId}`)
                                        : undefined
                                }
                            />
                        </div>
                        {isMilestoneBlock && <MilestoneControls milestone={block?.payload as MilestonePayload} />}
                    </div>
                    <div className="section">{blockContent}</div>
                </div>
            </div>
        </div>
    );
};

export default Block;
