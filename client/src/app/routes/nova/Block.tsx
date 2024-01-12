
import React, { useContext, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import mainHeaderMessage from "~assets/modals/stardust/block/main-header.json";
import { useBlock } from "~helpers/nova/hooks/useBlock";
import NotFound from "../../components/NotFound";
import { BasicBlockBody, BlockBodyType, PayloadType, ValidationBlockBody } from "@iota/sdk-wasm-nova/web";
import Modal from "~/app/components/Modal";
import Spinner from "~/app/components/Spinner";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { DateHelper } from "~/helpers/dateHelper";
import MilestoneSignaturesSection from "~/app/components/stardust/block/payload/milestone/MilestoneSignaturesSection";
import { Ed25519Signature } from "@iota/sdk-wasm/web";
import { useInputsAndOutputs } from "~/helpers/nova/hooks/useInputsAndOutputs";
import BlockPayloadSection from "~/app/components/nova/block/section/BlockPayloadSection";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import NetworkContext from "~/app/context/NetworkContext";
import TabbedSection from "~/app/components/hoc/TabbedSection";
import taggedDataPayloadInfo from "~assets/modals/stardust/block/tagged-data-payload.json";
import transactionPayloadInfo from "~assets/modals/stardust/block/transaction-payload.json";
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

const Block: React.FC<RouteComponentProps<BlockProps>> = (
    { history, match: { params: { network, blockId } } }
) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);
    const [block, isLoading, blockError] = useBlock(network, blockId);
    const [inputs, outputs, transferTotal] = useInputsAndOutputs(network, block);

    let blockBody: BasicBlockBody | ValidationBlockBody | undefined
    let pageTitle = "Block";
    switch (block?.body?.type) {
        case BlockBodyType.Basic: {
            pageTitle = `Basic ${pageTitle}`;
            blockBody = block?.body as BasicBlockBody 
            break;
        }
        case BlockBodyType.Validation: {
            pageTitle = `Validation ${pageTitle}`;
            blockBody = block?.body as ValidationBlockBody 
            break;
        }
        default: {
            break;
        }
    }

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
            />
        );
    }
    
    const blockContent = block ? (
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
                <div className="value code">
                    <TruncatedId id={blockId} showCopyButton />
                </div>
            </div>
            <div className="section--data">
                <div className="label">
                    Issuing Time
                </div>
                <div className="value code">
                    {/* Convert nanoseconds to milliseconds */}
                    {DateHelper.formatShort(Number(block.header.issuingTime) / 1000000)}
                </div>
            </div>
            <div className="section--data">
                <div className="label">
                    Slot commitment
                </div>
                <div className="value code">
                    <TruncatedId id={block.header.slotCommitmentId} />
                </div>
            </div>
            <div className="section--data">
                <div className="label">
                    Issuer
                </div>
                <div className="value code">
                    <TruncatedId id={block.header.issuerId} showCopyButton={true}/>
                </div>
            </div>

            <div className="section--data row row--tablet-responsive">
                {blockBody?.strongParents && (
                    <div className="truncate margin-b-s margin-r-m">
                        <div className="label">
                            Strong Parents
                        </div>
                        {blockBody.strongParents.map((parent, idx) => (
                            <div
                                key={idx}
                                style={{ marginTop: "8px" }}
                                className="value code link"
                            >
                                <TruncatedId
                                    id={parent}
                                    // link={isLinksDisabled ? undefined : `/${network}/block/${parent}`}
                                />
                            </div>
                        ))}
                    </div>
                )}
                {blockBody?.weakParents && (
                    <div className="truncate">
                        <div className="label">
                            Weak Parents
                        </div>
                        {blockBody.weakParents.map((child, idx) => (
                            <div
                                key={idx}
                                style={{ marginTop: "8px" }}
                                className="value code link"
                            >
                                <TruncatedId
                                    id={child}
                                    // link={isLinksDisabled ? undefined : `/${network}/block/${child}`}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {blockBody?.type === BlockBodyType.Basic && (
                <div>
                    {blockBody?.asBasic().payload?.type === PayloadType.SignedTransaction &&
                    transferTotal !== null && (
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
                            </div>
                        </div>
                    )}

                    <TabbedSection
                        key={blockId}
                        tabsEnum={
                                (blockBody?.asBasic().payload?.type === PayloadType.SignedTransaction ?
                                    { Payload: "Transaction Payload" } :
                                    { Payload: "Tagged Data Payload" })
                        }
                        tabOptions={
                            (blockBody?.asBasic().payload?.type === PayloadType.SignedTransaction ? {
                                "Transaction Payload": {
                                    disabled: !blockBody?.asBasic().payload,
                                    infoContent: transactionPayloadInfo
                                }
                            } : {
                                "Tagged Data Payload": {
                                    disabled: !blockBody?.asBasic().payload,
                                    infoContent: taggedDataPayloadInfo
                                }
                            })
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
                        </div>
                    </div>
                    <div className="section">{blockContent}</div>
                </div>
            </div>
        </div>
    );
};

export default Block;

