import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "~assets/modals/stardust/block/main-header.json";
import metadataInfo from "~assets/modals/stardust/block/metadata.json";
import { useBlock } from "~helpers/nova/hooks/useBlock";
import NotFound from "../../components/NotFound";
import { AccountAddress, BasicBlockBody, PayloadType, SignedTransactionPayload, Utils, ValidationBlockBody } from "@iota/sdk-wasm-nova/web";
import Modal from "~/app/components/Modal";
import Spinner from "~/app/components/Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { DateHelper } from "~/helpers/dateHelper";
import MilestoneSignaturesSection from "~/app/components/stardust/block/payload/milestone/MilestoneSignaturesSection";
import { Ed25519Signature } from "@iota/sdk-wasm-stardust/web";
import { useInputsAndOutputs } from "~/helpers/nova/hooks/useInputsAndOutputs";
import BlockPayloadSection from "~/app/components/nova/block/section/BlockPayloadSection";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import TabbedSection from "~/app/components/hoc/TabbedSection";
import taggedDataPayloadInfo from "~assets/modals/stardust/block/tagged-data-payload.json";
import transactionPayloadInfo from "~assets/modals/stardust/block/transaction-payload.json";
import { useBlockMetadata } from "~/helpers/nova/hooks/useBlockMetadata";
import TransactionMetadataSection from "~/app/components/nova/block/section/TransactionMetadataSection";
import BlockTangleState from "~/app/components/nova/block/BlockTangleState";
import { useTransactionMetadata } from "~/helpers/nova/hooks/useTransactionMetadata";

export interface BlockProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The block to lookup.
     */
    blockId: string;
}

const Block: React.FC<RouteComponentProps<BlockProps>> = ({
    match: {
        params: { network, blockId },
    },
}) => {
    const { tokenInfo, manaInfo, bech32Hrp, protocolInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [isFormattedBalance, setIsFormattedBalance] = useState(false);
    const [isFormattedMana, setIsFormattedMana] = useState(false);
    const [block, isLoading, blockError] = useBlock(network, blockId);
    const [blockMetadata] = useBlockMetadata(network, blockId);
    const [inputs, outputs, transferTotal] = useInputsAndOutputs(network, block);
    const [blockBody, setBlockBody] = useState<BasicBlockBody | ValidationBlockBody>();
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const { transactionMetadata } = useTransactionMetadata(network, transactionId);
    const [pageTitle, setPageTitle] = useState<string>("Block");
    let blockCost: number | null = null;

    function updatePageTitle(type: PayloadType | undefined): void {
        let title = null;
        switch (type) {
            case PayloadType.TaggedData:
                title = "Data";
                break;
            case PayloadType.SignedTransaction:
                title = "Transaction";
                break;
            case PayloadType.CandidacyAnnouncement:
                title = "Candidacy Announcement";
                break;
        }

        if (title) {
            setPageTitle(`${title} Block`);
        }
    }
    useEffect(() => {
        if (block?.isBasic()) {
            const body = block.body.asBasic();
            setBlockBody(body);
            updatePageTitle(body.payload?.type);

            if (body.payload?.type === PayloadType.SignedTransaction) {
                const tsxId = Utils.transactionId(body.payload as SignedTransactionPayload);
                setTransactionId(tsxId);
            }
        }
        if (block?.isValidation()) {
            setBlockBody(block?.body.asValidation());
            setPageTitle(`Validation Block`);
            setTransactionId(null);
        }
    }, [block]);

    const tabbedSections = [];
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

        if (protocolInfo?.parameters?.workScoreParameters) {
            blockCost = Utils.blockWorkScore(block, protocolInfo?.parameters.workScoreParameters);
        }
    }

    if (transactionMetadata) {
        tabbedSections.push(
            <TransactionMetadataSection
                key={++idx}
                transaction={((block?.body as BasicBlockBody)?.payload as SignedTransactionPayload)?.transaction}
                transactionMetadata={transactionMetadata}
            />,
        );
    }

    const slotIndex = block?.header.slotCommitmentId ? Utils.computeSlotIndex(block.header.slotCommitmentId) : null;
    const issuerAddress = block?.header.issuerId ? Utils.addressToBech32(new AccountAddress(block.header.issuerId), bech32Hrp) : null;

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
            {transactionId && (
                <div className="section--data">
                    <div className="label">Transaction ID</div>
                    <div className="value value__secondary row middle highlight">
                        <TruncatedId id={transactionId} link={`/${network}/transaction/${transactionId}`} showCopyButton />
                    </div>
                </div>
            )}
            <div className="section--data">
                <div className="label">Issuing Time</div>
                <div className="value code">{DateHelper.formatShort(Number(block.header.issuingTime) / 1000000)}</div>
            </div>
            <div className="section--data">
                <div className="label">Slot Commitment</div>
                <div className="value code highlight">
                    <TruncatedId id={block.header.slotCommitmentId} link={`/${network}/slot/${slotIndex}`} />
                </div>
            </div>
            <div className="section--data">
                <div className="label">Latest Finalized Slot</div>
                <div className="value code">{block.header.latestFinalizedSlot}</div>
            </div>
            {issuerAddress && (
                <div className="section--data">
                    <div className="label">Issuer</div>
                    <div className="value code highlight">
                        <TruncatedId id={issuerAddress} link={`/${network}/addr/${issuerAddress}`} showCopyButton={true} />
                    </div>
                </div>
            )}
            <div className="section--data row row--tablet-responsive">
                {blockBody?.strongParents && (
                    <div className="truncate margin-b-s margin-r-m">
                        <div className="label">Strong Parents</div>
                        {blockBody.strongParents.map((parent, idx) => (
                            <div key={idx} style={{ marginTop: "8px" }} className="value code link">
                                <TruncatedId id={parent} link={`/${network}/block/${parent}`} />
                            </div>
                        ))}
                    </div>
                )}
                {blockBody?.weakParents && (
                    <div className="truncate">
                        <div className="label">Weak Parents</div>
                        {blockBody.weakParents.map((weak, idx) => (
                            <div key={idx} style={{ marginTop: "8px" }} className="value code link">
                                <TruncatedId id={weak} link={`/${network}/block/${weak}`} />
                            </div>
                        ))}
                    </div>
                )}
                {blockBody?.shallowLikeParents && (
                    <div className="truncate">
                        <div className="label">Shallow Parents</div>
                        {blockBody.shallowLikeParents.map((shallow, idx) => (
                            <div key={idx} style={{ marginTop: "8px" }} className="value code link">
                                <TruncatedId id={shallow} link={`/${network}/block/${shallow}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {blockBody?.isValidation() && (
                <div className="section--data">
                    <div className="label">Highest Supported Protocol Version</div>
                    <div className="value code">{blockBody.asValidation().highestSupportedVersion}</div>
                </div>
            )}
            {blockBody?.isBasic() && (
                <div>
                    {blockCost !== null && (
                        <div className="section--data">
                            <div className="label">Block Cost</div>
                            <div className="value code">
                                <span
                                    className="pointer"
                                    onClick={() => {
                                        setIsFormattedMana(!isFormattedMana);
                                    }}
                                >
                                    {formatAmount(blockCost, manaInfo, isFormattedMana)}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="section--data">
                        <div className="label">Max Burned Mana</div>
                        <div className="value code">
                            <span
                                className="pointer"
                                onClick={() => {
                                    setIsFormattedMana(!isFormattedMana);
                                }}
                            >
                                {formatAmount(blockBody.asBasic().maxBurnedMana, manaInfo, isFormattedMana)}
                            </span>
                        </div>
                    </div>
                    {blockBody.asBasic().payload?.type === PayloadType.SignedTransaction && transferTotal !== null && (
                        <div className="section--data">
                            <div className="label">Amount Transacted</div>
                            <div className="amount-transacted value row middle">
                                <span onClick={() => setIsFormattedBalance(!isFormattedBalance)} className="pointer margin-r-5">
                                    {formatAmount(transferTotal, tokenInfo, isFormattedBalance)}
                                </span>
                            </div>
                        </div>
                    )}

                    <TabbedSection
                        key={blockId}
                        tabsEnum={
                            blockBody.asBasic().payload?.type === PayloadType.SignedTransaction
                                ? { Payload: "Transaction Payload", Metadata: "Metadata" }
                                : { Payload: "Tagged Data Payload" }
                        }
                        tabOptions={
                            blockBody.asBasic().payload?.type === PayloadType.SignedTransaction
                                ? {
                                      "Transaction Payload": {
                                          disabled: !blockBody.asBasic().payload,
                                          infoContent: transactionPayloadInfo,
                                      },
                                      Metadata: { infoContent: metadataInfo },
                                  }
                                : {
                                      "Tagged Data Payload": {
                                          disabled: !blockBody.asBasic().payload,
                                          infoContent: taggedDataPayloadInfo,
                                      },
                                  }
                        }
                    >
                        {tabbedSections}
                    </TabbedSection>
                </div>
            )}
            <MilestoneSignaturesSection signatures={[block.signature as Ed25519Signature]} />
        </React.Fragment>
    ) : null;

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
                            {blockMetadata.metadata && block?.header && (
                                <BlockTangleState status={blockMetadata.metadata?.blockState} issuingTime={block?.header.issuingTime} />
                            )}
                        </div>
                    </div>
                    <div className="section">{blockContent}</div>
                </div>
            </div>
        </div>
    );
};

export default Block;
