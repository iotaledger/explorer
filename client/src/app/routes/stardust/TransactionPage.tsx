/* eslint-disable react/jsx-no-useless-fragment */
import { PayloadType, RegularTransactionEssence, TransactionPayload as ITransactionPayload, Utils, UnlockConditionType, CommonOutput } from "@iota/sdk-wasm/web";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { TransactionPageProps } from "./TransactionPageProps";
import metadataInfoMessage from "~assets/modals/stardust/block/metadata.json";
import transactionPayloadMessage from "~assets/modals/stardust/transaction/main-header.json";
import { useBlockChildren } from "~helpers/hooks/useBlockChildren";
import { useBlockMetadata } from "~helpers/hooks/useBlockMetadata";
import { useInputsAndOutputs } from "~helpers/hooks/useInputsAndOutputs";
import { useTransactionIncludedBlock } from "~helpers/hooks/useTransactionIncludedBlock";
import { isMarketedNetwork } from "~helpers/networkHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import BlockTangleState from "../../components/stardust/block/BlockTangleState";
import TransactionPayload from "../../components/stardust/block/payload/TransactionPayload";
import BlockMetadataSection from "../../components/stardust/block/section/BlockMetadataSection";
import InclusionState from "../../components/stardust/InclusionState";
import TruncatedId from "../../components/stardust/TruncatedId";
import NetworkContext from "../../context/NetworkContext";
import "./TransactionPage.scss";
import { ServiceFactory } from "~factories/serviceFactory";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { STARDUST } from "~models/config/protocolVersion";
import { IInput } from "~models/api/stardust/IInput";
import { OutputResponse, ExpirationUnlockCondition } from "@iota/sdk-wasm/web";
import { DateHelper } from "~helpers/dateHelper";
import { HexHelper } from "~helpers/stardust/hexHelper";

enum TRANSACTION_PAGE_TABS {
    Payload = "Payload",
    BlockMetadata = "Block Metadata",
}

const TransactionPage: React.FC<RouteComponentProps<TransactionPageProps>> = ({
    history,
    match: {
        params: { network, transactionId },
    },
}) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [apiClient] = useState(() => ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [block, isIncludedBlockLoading, blockError] = useTransactionIncludedBlock(network, transactionId);
    const [inputs, unlocks, outputs, transferTotal, isInputsAndOutputsLoading] = useInputsAndOutputs(network, block);
    const [includedBlockId, setIncludedBlockId] = useState<string | null>(null);
    const [tangleNetworkId, setTangleNetworkId] = useState<string | undefined>();
    const [inputsCommitment, setInputsCommitment] = useState<string | undefined>();
    const [blockChildren] = useBlockChildren(network, includedBlockId);
    const [blockMetadata, isBlockMetadataLoading] = useBlockMetadata(network, includedBlockId);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const [inputsExtraInfo, setInputsExtraInfo] = useState<{ [outputId: string]: {unlockConditionOpenedIndexes?: number[];} }>({

    });


    const inputsWithExtraInfo = React.useMemo(() => {
        if (!inputs) return null;
        return inputs.map((input, idx) => {
            const extraInfo = inputsExtraInfo[input.outputId];
            return {
                ...input,
                unlockConditionOpenedIndexes: extraInfo?.unlockConditionOpenedIndexes ?? [],
            };
        });
    }, [inputs, inputsExtraInfo]);

    useEffect(() => {
        if (block?.payload?.type === PayloadType.Transaction) {
            const transactionPayload = block.payload as ITransactionPayload;
            const transactionEssence = transactionPayload.essence as RegularTransactionEssence;
            setIncludedBlockId(Utils.blockId(block));
            setTangleNetworkId(transactionEssence.networkId);
            setInputsCommitment(transactionEssence.inputsCommitment);
        }
    }, [block]);

    const updateInputExtraInfo = async (input: IInput) => {
        if (isExpirationExists(input)) {
            if (isOutputSpent(input)) {
                const transactionSpentId = input?.output?.metadata.transactionIdSpent as string;
                const transactionTimestamp = await getTransactionTimestamp(transactionSpentId, apiClient, network);

                const expirationUnlockCondition = getUnlockCondition(input, UnlockConditionType.Expiration) as ExpirationUnlockCondition;
                const isSpentAfterUnlock =
                    expirationUnlockCondition &&
                    transactionTimestamp &&
                    DateHelper.isExpired(expirationUnlockCondition.unixTime * 1000, transactionTimestamp);

                let indexes: number[] = [];
                if (isSpentAfterUnlock) {
                    indexes = getUnlockConditionIndexes(input, UnlockConditionType.Expiration);
                } else {
                    indexes = getUnlockConditionIndexes(input, UnlockConditionType.Address);
                }
                setInputsExtraInfo((prev) => ({
                    ...prev,
                    [input.outputId]: {
                        unlockConditionOpenedIndexes: indexes,
                    },
                }));

            } else {
                const expirationUnlockCondition = getUnlockCondition(input, UnlockConditionType.Expiration) as ExpirationUnlockCondition;
                const isExpired = expirationUnlockCondition && DateHelper.isExpired(expirationUnlockCondition.unixTime * 1000);
                let indexes: number[] = [];
                if (isExpired) {
                    indexes = getUnlockConditionIndexes(input, UnlockConditionType.Expiration);
                } else {
                    indexes = getUnlockConditionIndexes(input, UnlockConditionType.Address);
                }

                setInputsExtraInfo((prev) => ({
                    ...prev,
                    [input.outputId]: {
                        unlockConditionOpenedIndexes: indexes,
                    },
                }));
            }
        } else {
            const indexes = getUnlockConditionIndexes(input, UnlockConditionType.Address);
            setInputsExtraInfo((prev) => ({
                ...prev,
                [input.outputId]: {
                    unlockConditionOpenedIndexes: indexes,
                },
            }));
        }
    }

    useEffect(() => {
        (async () => {
            if (!inputs) return;

            await Promise.all(inputs.map(input => {
                updateInputExtraInfo(input);
            }));
        })();

    }, [inputs, setInputsExtraInfo]);

    const { metadata, metadataError, conflictReason, blockTangleStatus } = blockMetadata;
    const isLinksDisabled = metadata?.ledgerInclusionState === "conflicting";
    const isMarketed = isMarketedNetwork(network);

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
            {includedBlockId && (
                <div className="section--data">
                    <div className="label">Included in block</div>
                    <div className="value code highlight">
                        <TruncatedId id={includedBlockId} link={`/${network}/block/${includedBlockId}`} showCopyButton />
                    </div>
                </div>
            )}
            {tangleNetworkId && (
                <div className="section--data">
                    <div className="label">Network ID</div>
                    <div className="value code row middle">
                        <span className="margin-r-t">{tangleNetworkId}</span>
                    </div>
                </div>
            )}
            {inputsCommitment && (
                <div className="section--data">
                    <div className="label">Input commitment</div>
                    <div className="value code row middle">
                        <TruncatedId id={inputsCommitment} showCopyButton />
                    </div>
                </div>
            )}
            {block?.nonce && (
                <div className="section--data">
                    <div className="label">Nonce</div>
                    <div className="value row middle">
                        <span className="margin-r-t">{block?.nonce}</span>
                    </div>
                </div>
            )}
            {transferTotal !== null && (
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
                tabsEnum={TRANSACTION_PAGE_TABS}
                tabOptions={{
                    [TRANSACTION_PAGE_TABS.Payload]: {
                        disabled: !inputs || !unlocks || !outputs,
                        isLoading: isInputsAndOutputsLoading,
                        infoContent: transactionPayloadMessage,
                    },
                    [TRANSACTION_PAGE_TABS.BlockMetadata]: {
                        isLoading: isBlockMetadataLoading,
                        infoContent: metadataInfoMessage,
                    },
                }}
            >
                {inputsWithExtraInfo && unlocks && outputs ? (
                    <div className="section">
                        <TransactionPayload network={network} inputs={inputsWithExtraInfo} unlocks={unlocks} outputs={outputs} />
                    </div>
                ) : (
                    <></>
                )}
                <BlockMetadataSection
                    network={network}
                    metadata={metadata}
                    metadataError={metadataError}
                    blockChildren={blockChildren}
                    conflictReason={conflictReason}
                    isLinksDisabled={isLinksDisabled}
                />
                <div className="section metadata-section">
                    <div className="section--data">
                        {metadataError && <p className="danger">Failed to retrieve metadata. {metadataError}</p>}
                        {metadata && !metadataError && (
                            <React.Fragment>
                                <div className="section--data">
                                    <div className="label">Is Solid</div>
                                    <div className="value row middle">
                                        <span className="margin-r-t">{metadata?.isSolid ? "Yes" : "No"}</span>
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="label">Inclusion Status</div>
                                    <div className="value row middle">
                                        <InclusionState state={metadata?.ledgerInclusionState} />
                                    </div>
                                </div>
                                {conflictReason && (
                                    <div className="section--data">
                                        <div className="label">Conflict Reason</div>
                                        <div className="value">{conflictReason}</div>
                                    </div>
                                )}
                                {metadata?.parents && (
                                    <div className="section--data">
                                        <div className="label">Parents</div>
                                        {metadata.parents.map((parent, idx) => (
                                            <div key={idx} style={{ marginTop: "8px" }} className="value code link">
                                                <TruncatedId id={parent} link={`/${network}/block/${parent}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </React.Fragment>
                        )}
                    </div>
                </div>
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
                            <BlockTangleState
                                network={network}
                                status={blockTangleStatus}
                                milestoneIndex={metadata?.referencedByMilestoneIndex}
                                hasConflicts={metadata?.ledgerInclusionState === "conflicting"}
                                onClick={
                                    metadata?.referencedByMilestoneIndex
                                        ? (blockId: string) => history.push(`/${network}/block/${blockId}`)
                                        : undefined
                                }
                            />
                        </div>
                    </div>
                    <div className="section">{transactionContent}</div>
                </div>
            </div>
        </div>
    );
};



function isOutputSpent(input: IInput) {
    const output = input.output as OutputResponse;
    return output.metadata.isSpent;
}

function getUnlockCondition(input: IInput, type: UnlockConditionType) {
    const output = input.output?.output as CommonOutput;
    if (!output?.unlockConditions) return null;

    return output.unlockConditions.find(i => i.type === type);
}

function getUnlockConditionIndexes(input: IInput, type: UnlockConditionType) {
    const output = input.output?.output as CommonOutput;
    if (!output?.unlockConditions) return [];

    return output.unlockConditions.map((i, idx) => {
        if (i.type === type) {
            return idx;
        }
    }).filter(i => i !== undefined) as number[];
}

// If expiration unlock condition exists - return true.
function isExpirationExists(input: IInput) {
    const output = input.output?.output as CommonOutput;
    if (!output?.unlockConditions) return false;

    return output.unlockConditions.some(i => i.type === UnlockConditionType.Expiration);
}

async function getTransactionTimestamp(transactionId: string, apiClient: StardustApiClient, network: string) {
    const blockResp = await apiClient.transactionIncludedBlockDetails({ network, transactionId });

    if (blockResp?.block?.payload?.type !== PayloadType.Transaction) return null;

    const includedBlockId = Utils.blockId(blockResp.block);

    const blockMetadataResp = await apiClient.blockDetails({
        network,
        blockId: HexHelper.addPrefix(includedBlockId),
    });

    const blockMetadata = blockMetadataResp?.metadata;
    const referencedByMilestoneIndex = blockMetadata?.referencedByMilestoneIndex;
    if (referencedByMilestoneIndex === undefined) return null;

    const milestoneResp = await apiClient.milestoneDetails({ network, milestoneIndex: referencedByMilestoneIndex });
    if (!milestoneResp?.milestone?.timestamp) return null;

    return DateHelper.milliseconds(milestoneResp.milestone.timestamp);
}


export default TransactionPage;
