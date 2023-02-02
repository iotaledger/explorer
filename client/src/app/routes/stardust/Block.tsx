/* eslint-disable @typescript-eslint/no-shadow */
import {
    MILESTONE_PAYLOAD_TYPE, TRANSACTION_PAYLOAD_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE, milestoneIdFromMilestonePayload, IMilestonePayload
} from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "../../../assets/modals/stardust/block/main-header.json";
import metadataInfo from "../../../assets/modals/stardust/block/metadata.json";
import milestonePayloadInfo from "../../../assets/modals/stardust/block/milestone-payload.json";
import referencedBlocksInfo from "../../../assets/modals/stardust/block/milestone-referenced-blocks.json";
import taggedDataPayloadInfo from "../../../assets/modals/stardust/block/tagged-data-payload.json";
import transactionPayloadInfo from "../../../assets/modals/stardust/block/transaction-payload.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../../models/tangleStatus";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import BlockMetadataSection from "../../components/stardust/BlockMetadataSection";
import BlockPayloadSection from "../../components/stardust/BlockPayloadSection";
import BlockTangleState from "../../components/stardust/BlockTangleState";
import MilestoneControls from "../../components/stardust/MilestoneControls";
import ReferencedBlocksSection from "../../components/stardust/section/referenced-blocks/ReferencedBlocksSection";
import NetworkContext from "../../context/NetworkContext";
import { TransactionsHelper } from "./../../../helpers/stardust/transactionsHelper";
import { BlockProps } from "./BlockProps";
import { BlockData, BlockMetadata } from "./BlockState";
import "./Block.scss";

const Block: React.FC<RouteComponentProps<BlockProps>> = (
    { history, match: { params: { network, blockId } } }
) => {
    const isMounted = useIsMounted();
    const { tokenInfo, bech32Hrp, protocolVersion } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const [jobToStatus, setJobToStatus] = useState(new Map<string, PromiseStatus>());
    const [updateMetadataTimerId, setUpdateMetadataTimerId] = useState<NodeJS.Timer | undefined>();
    const [blockData, setBlockData] = useState<BlockData>({});
    const [blockMetadata, setBlockMetadata] = useState<BlockMetadata>({ blockTangleStatus: "pending" });
    const [milestoneReferencedBlocks, setMilestoneReferencedBlocks] = useState<
        { milestoneId?: string; blocks?: string[]; error?: string } | undefined
    >();

    useEffect(() => {
        setBlockData({});
        setBlockMetadata({ blockTangleStatus: "pending" });
        // eslint-disable-next-line no-void
        void loadBlock(blockId);
        return () => {
            if (updateMetadataTimerId) {
                clearTimeout(updateMetadataTimerId);
            }
        };
    }, [blockId]);

    useEffect(() => {
        if (!blockData.blockError) {
            // eslint-disable-next-line no-void
            void updateBlockDetails();
        }

        if (blockData.block?.payload?.type === MILESTONE_PAYLOAD_TYPE) {
            const milestonePayload = blockData.block?.payload;
            const milestoneId = milestoneIdFromMilestonePayload(milestonePayload);
            // eslint-disable-next-line no-void
            void loadMilestoneReferencedBlocks(milestoneId);
        }
    }, [blockData]);

    /**
     * Load the block with the given id.
     * @param blockId The index to load.
     */
    const loadBlock = async (blockId: string): Promise<void> => {
        const blockLoadMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set("loadBlock", status));
        });

        // eslint-disable-next-line no-void
        void blockLoadMonitor.enqueue(
            async () => tangleCacheService.block(network, blockId).then(
                async response => {
                    if (response.block) {
                        let transactionId;
                        const block = response.block;
                        const { inputs, unlocks, outputs, transferTotal } =
                            await TransactionsHelper.getInputsAndOutputs(
                                block,
                                network,
                                bech32Hrp,
                                tangleCacheService
                            );

                        if (block.payload?.type === TRANSACTION_PAYLOAD_TYPE) {
                            transactionId = TransactionsHelper.computeTransactionIdFromTransactionPayload(
                                block.payload
                            );
                        }

                        if (isMounted) {
                            setBlockData(
                                {
                                    block,
                                    inputs,
                                    unlocks,
                                    outputs,
                                    transferTotal,
                                    transactionId
                                }
                            );
                        }
                    } else if (isMounted) {
                        setBlockData({ blockError: response.error ?? "Couldn't load block" });
                    }
                }
            )
        );
    };

    /**
     * Update the block details.
     */
    const updateBlockDetails = async (): Promise<void> => {
        const blockDetailsLoadMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set("loadBlockDetails", status));
        });

        // eslint-disable-next-line no-void
        void blockDetailsLoadMonitor.enqueue(
            async () => tangleCacheService.blockDetails(network, blockId).then(
                details => {
                    if (isMounted) {
                        setBlockMetadata({
                            metadata: details?.metadata,
                            metadataError: details?.error,
                            conflictReason: calculateConflictReason(details?.metadata),
                            blockTangleStatus: calculateStatus(details?.metadata)
                        });

                        // requeue job until block is referenced
                        if (!details?.metadata?.referencedByMilestoneIndex) {
                            setUpdateMetadataTimerId(
                                setTimeout(async () => {
                                    await updateBlockDetails();
                                }, 10000)
                            );
                        }
                    }
                }
            )
        );
    };

    /**
     * Load milestone referenced blocks.
     * @param milestoneId The computed milestone id.
     */
    const loadMilestoneReferencedBlocks = async (milestoneId: string): Promise<void> => {
        const referencedBlocksPromiseMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set("loadMilestoneRefBlocks", status));
        });

        // eslint-disable-next-line no-void
        void referencedBlocksPromiseMonitor.enqueue(
            async () => tangleCacheService.milestoneReferencedBlocks(network, milestoneId).then(
                milestoneBlocksResponse => {
                    if (isMounted) {
                        setMilestoneReferencedBlocks(milestoneBlocksResponse);
                    }
                }
            )
        );
    };

    const { block, blockError, transactionId, inputs, unlocks, outputs, transferTotal } = blockData;
    const { metadata, metadataError, conflictReason, blockTangleStatus } = blockMetadata;

    const isMarketed = isMarketedNetwork(network);
    const isMilestoneBlock = block?.payload?.type === MILESTONE_PAYLOAD_TYPE;
    const isTransactionBlock = block?.payload?.type === TRANSACTION_PAYLOAD_TYPE;
    const isLinksDisabled = metadata?.ledgerInclusionState === "conflicting";
    const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);
    const milestoneId = isMilestoneBlock ?
        milestoneIdFromMilestonePayload(block.payload as IMilestonePayload) : undefined;
    const milestoneIndex = isMilestoneBlock ? (block.payload as IMilestonePayload).index : undefined;
    let pageTitle = "Block";
    switch (block?.payload?.type) {
        case MILESTONE_PAYLOAD_TYPE:
            pageTitle = `Milestone Block ${milestoneIndex}`;
            break;
        case TRANSACTION_PAYLOAD_TYPE:
            pageTitle = "Transaction Block";
            break;
        case TAGGED_DATA_PAYLOAD_TYPE:
            pageTitle = "Data Block";
            break;
        default:
            break;
    }

    if (blockError) {
        return (
            <div className="block">
                <div className="wrapper">
                    <div className="inner">
                        <div className="block--header">
                            <div className="row middle">
                                <h1>
                                    {pageTitle}
                                </h1>
                                <Modal icon="info" data={mainHeaderMessage} />
                            </div>
                        </div>
                        <NotFound
                            searchTarget="block"
                            query={blockId}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const tabbedSections = [];
    let idx = 0;
    if (isMilestoneBlock) {
        tabbedSections.push(
            <ReferencedBlocksSection key={++idx} blockIds={milestoneReferencedBlocks?.blocks} />
        );
    }
    if (block) {
        tabbedSections.push(
            <BlockPayloadSection
                key={++idx}
                network={network}
                protocolVersion={protocolVersion}
                block={block}
                inputs={inputs}
                unlocks={unlocks}
                outputs={outputs}
                transferTotal={transferTotal}
                history={history}
                isLinksDisabled={isLinksDisabled}
            />
        );
        tabbedSections.push(
            <BlockMetadataSection
                key={++idx}
                network={network}
                metadata={metadata}
                metadataError={metadataError}
                conflictReason={conflictReason}
                isLinksDisabled={isLinksDisabled}
                history={history}
            />
        );
    }

    const blockContent = !block ? null : (
        <React.Fragment>
            <div className="section--header row row--tablet-responsive middle space-between">
                <div className="row middle">
                    <h2>General</h2>
                </div>
            </div>
            <div className="section--data">
                <div className="label">
                    Block ID
                </div>
                <div className="value code row middle">
                    <span className="margin-r-t">
                        {blockId}
                    </span>
                    <CopyButton copy={blockId} />
                </div>
            </div>
            {milestoneId && (
                <div className="section--data">
                    <div className="label">
                        Milestone ID
                    </div>
                    <div className="value code row middle">
                        <span className="margin-r-t">
                            {milestoneId}
                        </span>
                        <CopyButton copy={milestoneId} />
                    </div>
                </div>
            )}
            {transactionId && (
                <div className="section--data">
                    <div className="label">
                        Transaction Id
                    </div>
                    <div className="value value__secondary row middle link">
                        {isLinksDisabled ?
                            <span className="margin-r-t">
                                {transactionId}
                            </span> :
                            <Link
                                to={`/${network}/transaction/${transactionId}`}
                                className="margin-r-t"
                            >
                                {transactionId}
                            </Link>}
                        <CopyButton copy={transactionId} />
                    </div>
                </div>
            )}
            <div className="section--data">
                <div className="label">
                    Payload Type
                </div>
                <div className="value row middle">
                    {NameHelper.getPayloadType(block)}
                </div>
            </div>
            {!isMilestoneBlock && (
                <div className="section--data">
                    <div className="label">
                        Nonce
                    </div>
                    <div className="value row middle">
                        <span className="margin-r-t">{block?.nonce}</span>
                    </div>
                </div>
            )}
            {block?.payload?.type === TRANSACTION_PAYLOAD_TYPE &&
                transferTotal !== undefined && (
                    <div className="section--data">
                        <div className="label">
                            Amount transacted
                        </div>
                        <div className="amount-transacted value row middle">
                            <span
                                onClick={() => setIsFormattedBalance(!isFormattedBalance)}
                                className="pointer margin-r-5"
                            >
                                {formatAmount(
                                    transferTotal,
                                    tokenInfo,
                                    !isFormattedBalance
                                )}
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
                tabsEnum={
                    isMilestoneBlock ?
                        { RefBlocks: "Referenced Blocks", Payload: "Milestone Payload", Metadata: "Metadata" } :
                        (isTransactionBlock ?
                            { Payload: "Transaction Payload", Metadata: "Metadata" } :
                            { Payload: "Tagged Data Payload", Metadata: "Metadata" })
                }
                tabOptions={
                    isMilestoneBlock ?
                        {
                            "Referenced Blocks": {
                                disabled: !milestoneReferencedBlocks,
                                counter: milestoneReferencedBlocks?.blocks?.length ?? undefined,
                                infoContent: referencedBlocksInfo
                            },
                            "Milestone Payload": { disabled: !block?.payload, infoContent: milestonePayloadInfo },
                            "Metadata": { infoContent: metadataInfo }
                        } : (isTransactionBlock ? {
                            "Transaction Payload": {
                                disabled: !block?.payload,
                                infoContent: transactionPayloadInfo
                            },
                            "Metadata": { infoContent: metadataInfo }
                        } : {
                            "Tagged Data Payload": {
                                disabled: !block?.payload,
                                infoContent: taggedDataPayloadInfo
                            },
                            "Metadata": { infoContent: metadataInfo }

                        })
                }
            >
                {tabbedSections}
            </TabbedSection>
        </React.Fragment >
    );

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
                                onClick={metadata?.referencedByMilestoneIndex
                                    ? (blockId: string) => history.push(`/${network}/block/${blockId}`)
                                    : undefined}
                            />
                        </div>
                        {isMilestoneBlock && (
                            <MilestoneControls
                                milestone={block.payload as IMilestonePayload}
                            />
                        )}
                    </div>
                    <div className="section">{blockContent}</div>
                </div>
            </div>
        </div>
    );
};

export default Block;

