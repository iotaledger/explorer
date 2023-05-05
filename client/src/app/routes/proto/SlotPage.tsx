import React from "react";
import { RouteComponentProps } from "react-router-dom";
import metadataMessage from "../../../assets/modals/stardust/block/metadata.json";
import { useSlot, useSlotBlocks, useSlotTxs } from "../../../helpers/proto/useSlot";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import ShortID, { LinkType } from "./ShortID";
import "./SlotPage.scss";

interface SlotPageProps {
    network: string;
    slotId: string;
}

const SlotPage: React.FC<RouteComponentProps<SlotPageProps>> = (
    { history, match: { params: { network, slotId } } }
) => {
    const [slot, isSlotLoading] = useSlot(network, slotId);
    const [txs, areTxsLoading] = useSlotTxs(network, slotId);
    const [blocks, areBlocksLoading] = useSlotBlocks(network, slotId);

    if (isSlotLoading || !slot) {
        return <div />;
    }

    return (
        <div className="slot-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header row space-between">
                        <div className="row middle">
                            <h1>Slot {slot.index}</h1>
                            <Modal icon="info" data={metadataMessage} />
                        </div>
                        <div className="section--data row middle">
                            <button
                                className="milestone-action margin-r-t"
                                type="button"
                                disabled={!slot.prevID}
                                onClick={() => history?.push(`/${network}/slot/${slot.prevID}`)}
                            >
                                <span>Previous</span>
                            </button>
                            {/*
                               <button
                               className="milestone-action margin-r-t"
                               type="button"
                               disabled={!slot.nextRoot}
                               onClick={() => history?.push(`/${network}/slot/${slot.nextRoot}`)}
                               >
                               <span>Next</span>
                               </button>
                               */}
                        </div>
                    </div>
                    <div className="top">
                        <div className="sections">
                            <div className="section">
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>General</h2>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    {/*
                                    <div className="col fill margin-b-s">
                                    <div className="section--data">
                                    <div className="label">Committed</div>
                                    <div className="value">{slot.committed ? "true" : "false"}</div>
                                    </div>
                                    </div>
                                */}
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Cumulative Stake</div>
                                            <div className="value">{slot.cumulativeWeight}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Roots</h2>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Commitment Root</div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={slot.rootsID}
                                                    linkType={LinkType.None} hasSlot={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/*
                                        <div className="col fill margin-b-s">
                                        <div className="section--data">
                                        <div className="label">Tangle Root</div>
                                        <div className="value">
                                        <ShortID
                                        network={network} id={slot.tangleRoot}
                                        linkType={LinkType.None} hasSlot={false}
                                        />
                                        </div>
                                        </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                        <div className="section--data">
                                        <div className="label">State Root</div>
                                        <div className="value">
                                        <ShortID
                                        network={network} id={slot.stateRoot}
                                        linkType={LinkType.None} hasSlot={false}
                                        />
                                        </div>
                                        </div>
                                        </div>
                                    */}
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    {/*
                                    <div className="col fill margin-b-s">
                                    <div className="section--data">
                                    <div className="label">Previous Root</div>
                                    <div className="value">
                                    <ShortID
                                    network={network} id={slot.previousRoot}
                                    linkType={LinkType.None} hasSlot={false}
                                    />
                                    </div>
                                    </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                    <div className="section--data">
                                    <div className="label">State Mutation Root</div>
                                    <div className="value">
                                    <ShortID
                                    network={network} id={slot.stateMutationRoot}
                                    linkType={LinkType.None} hasSlot={false}
                                    />
                                    </div>
                                    </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                    <div className="section--data">
                                    <div className="label">Mana Root</div>
                                    <div className="value">
                                    <ShortID
                                    network={network} id={slot.manaRoot}
                                    linkType={LinkType.None} hasSlot={false}
                                    />
                                    </div>
                                    </div>
                                    </div>
                                */}
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--header">
                                            <h2>Blocks - {blocks?.blocks.length}</h2>
                                            {areBlocksLoading && <Spinner />}
                                        </div>
                                        <div className="section--data">
                                            <div className="value">
                                                {blocks?.blocks.map((blockId, _) => (
                                                    <ShortID
                                                        hasSlot={true} marginTop={true}
                                                        linkType={LinkType.Block} key={blockId}
                                                        network={network} id={blockId}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--header">
                                            <h2>Transactions - {txs?.transactions.length}</h2>
                                            {areTxsLoading && <Spinner />}
                                        </div>
                                        <div className="section--data">
                                            <div className="value">
                                                {txs?.transactions.map((txId, _) => (
                                                    <ShortID
                                                        marginTop={true}
                                                        linkType={LinkType.Transaction} key={txId}
                                                        network={network} id={txId}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

SlotPage.defaultProps = {};

export default SlotPage;
