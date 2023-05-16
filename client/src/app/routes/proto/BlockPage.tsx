import moment from "moment";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import metadataMessage from "../../../assets/modals/stardust/block/metadata.json";
import { pastMarkersToNodes } from "../../../helpers/proto/misc";
import { useBlock, useBlockMeta } from "../../../helpers/proto/useBlock";
import TabbedSection from "../../components/hoc/TabbedSection";
import Modal from "../../components/Modal";
import BlockTransaction from "../../components/proto/BlockTransaction";
import Spinner from "../../components/Spinner";
import ShortID, { LinkType } from "./ShortID";
import "./BlockPage.scss";

enum BLOCK_PAGE_TABS {
    General = "General",
    Slot = "Slot",
    Metadata = "Metadata",
    Booker = "Booker",
    VirtualVoting = "Virtual Voting",
    Scheduler = "Scheduler",
    Other = "Other",
    Payload = "Payload",
    Transaction = "Transaction"
}

interface BlockPageProps {
    network: string;
    blockId: string;
}

const BlockPage: React.FC<RouteComponentProps<BlockPageProps>> = (
    { match: { params: { network, blockId } } }
) => {
    const [block, payloadName, isBlockLoading] = useBlock(network, blockId);
    const [blockMeta, isBlockMetaLoading] = useBlockMeta(network, blockId);

    if (isBlockLoading || isBlockMetaLoading || !block || !blockMeta) {
        return (
            <div className="block-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="block--header row space-between">
                            <div className="row middle">
                                <h1>Block</h1>
                                <Modal icon="info" data={metadataMessage} />
                                <Spinner />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="block-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header row space-between">
                        <div className="row middle">
                            <h1>{payloadName} Block</h1>
                            <Modal icon="info" data={metadataMessage} />
                        </div>
                    </div>
                    <div className="top">
                        <div className="sections">
                            <TabbedSection
                                tabsEnum={BLOCK_PAGE_TABS}
                                tabOptions={{
                                    "Payload": {
                                        hidden: block.payloadType.toString() !== "GenericDataPayloadType(0)"
                                    },
                                    "Transaction": {
                                        hidden: !block.transactionID
                                    }
                                }}
                            >
                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>General</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">
                                                    ID
                                                </div>
                                                <div className="value text-truncate">{blockId}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Issuing Time</div>
                                                <div
                                                    className="value"
                                                >{moment(block.issuingTime * 1000).format()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">
                                                    Issuer Public Key
                                                </div>
                                                <div className="value text-truncate">{block.issuerPublicKey}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">
                                                    Sequence Number
                                                </div>
                                                <div className="value">{block.sequenceNumber}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Slot</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Commitment</div>
                                                <div className="value">
                                                    <ShortID
                                                        hasSlot={true}
                                                        linkType={LinkType.Slot}
                                                        network={network} id={block.commitmentID}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Latest Confirmed Slot</div>
                                                <div className="value">{block.latestConfirmedSlot}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s" />
                                    </div>
                                </div>

                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Metadata</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Solid</div>
                                                <div className="value">{blockMeta.solid ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Invalid</div>
                                                <div className="value">{blockMeta.invalid ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Orphaned</div>
                                                <div className="value">{blockMeta.orphaned ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Booker</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Booked</div>
                                                <div className="value">{blockMeta.booked ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Booked Time</div>
                                                <div className="value">{moment(blockMeta.bookedTime).format()}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s" />
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Conflict IDs</div>
                                                <div className="value">
                                                    {Object.keys(blockMeta.conflictIDs).length === 0 ?
                                                        "-"
                                                        :
                                                        Object.entries(blockMeta.conflictIDs).map(entry => (
                                                            <ShortID
                                                                hasSlot={false} marginTop={true}
                                                                linkType={LinkType.Conflict} key={entry[0]}
                                                                network={network} id={entry[0]}
                                                            />))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Added Conflict IDs</div>
                                                <div className="value">
                                                    {Object.keys(blockMeta.addedConflictIDs).length === 0 ?
                                                        "-"
                                                        :
                                                        Object.entries(blockMeta.addedConflictIDs).map(entry => (
                                                            <ShortID
                                                                hasSlot={false} marginTop={true}
                                                                linkType={LinkType.Conflict} key={entry[0]}
                                                                network={network} id={entry[0]}
                                                            />))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Subtracted Conflict IDs</div>
                                                <div className="value">
                                                    {Object.keys(blockMeta.subtractedConflictIDs).length === 0 ?
                                                        "-"
                                                        :
                                                        Object.entries(blockMeta.subtractedConflictIDs).map(entry => (
                                                            <ShortID
                                                                hasSlot={false} marginTop={true}
                                                                linkType={LinkType.Conflict} key={entry[0]}
                                                                network={network} id={entry[0]}
                                                            />))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Virtual Voting</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Tracked</div>
                                                <div className="value">{blockMeta.tracked ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Subjectively Invalid</div>
                                                <div className="value">
                                                    {blockMeta.subjectivelyInvalid ? "true" : "false"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Tracked Time</div>
                                                <div className="value">{blockMeta.trackedTime}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Scheduler</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Scheduled</div>
                                                <div className="value">{blockMeta.scheduled ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Dropped</div>
                                                <div className="value">{blockMeta.dropped ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Scheduler Time</div>
                                                <div className="value">{blockMeta.schedulerTime}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Skipped</div>
                                                <div className="value">{blockMeta.skipped ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s" />
                                        <div className="col fill margin-b-s" />
                                    </div>
                                </div>

                                <div className="section">
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Block Gadget</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Accepted</div>
                                                <div className="value">{blockMeta.accepted ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Accepted Time</div>
                                                <div className="value">{blockMeta.acceptedTime}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s" />
                                    </div>
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Confirmation</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Confirmed</div>
                                                <div className="value">{blockMeta.confirmed ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Confirmed Time</div>
                                                <div
                                                    className="value"
                                                >{moment(blockMeta.confirmedTime).format()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Confirmed By Slot</div>
                                                <div className="value">{blockMeta.confirmedBySlot}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>Structure Details</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Rank</div>
                                                <div className="value">
                                                    {blockMeta.structureDetails.rank}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Past Marker Gap</div>
                                                <div className="value">
                                                    {blockMeta.structureDetails.pastMarkerGap}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Is Past Marker</div>
                                                <div className="value">
                                                    {blockMeta.structureDetails.isPastMarker ? "true" : "false"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Past Markers</div>
                                                <div className="value">
                                                    {pastMarkersToNodes(blockMeta.structureDetails.pastMarkers)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="section--header">
                                        <div className="row middle">
                                            <h2>References</h2>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Strong Parents</div>
                                                <div className="value">
                                                    {block.strongParents.length === 0 ?
                                                        "-"
                                                        :
                                                        block.strongParents.map((parent, _) => (
                                                            <ShortID
                                                                hasSlot={true} marginTop={true}
                                                                linkType={LinkType.Block} key={parent}
                                                                network={network} id={parent}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Weak Parents</div>
                                                <div className="value">
                                                    {block.weakParents.length === 0 ?
                                                        "-"
                                                        :
                                                        block.weakParents.map((parent, _) => (
                                                            <ShortID
                                                                hasSlot={true} marginTop={true}
                                                                linkType={LinkType.Block} key={parent}
                                                                network={network} id={parent}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Shallow Like Parents</div>
                                                <div className="value">
                                                    {block.shallowLikeParents.length === 0 ?
                                                        "-"
                                                        :
                                                        block.shallowLikeParents.map((parent, _) => (
                                                            <ShortID
                                                                hasSlot={true} marginTop={true}
                                                                linkType={LinkType.Block} key={parent}
                                                                network={network} id={parent}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row--tablet-responsive fill margin-b-s">
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="section--data">
                                                    <div className="label">Strong Children</div>
                                                    <div className="value">
                                                        {Object.keys(blockMeta.strongChildren).length === 0 ?
                                                            "-"
                                                            :
                                                            Object.keys(blockMeta.strongChildren ?? {})
                                                                .map((parent, _) => (
                                                                    <ShortID
                                                                        hasSlot={true} marginTop={true}
                                                                        linkType={LinkType.Block} key={parent}
                                                                        network={network} id={parent}
                                                                    />
                                                                ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Weak Children</div>
                                                <div className="value">
                                                    {Object.keys(blockMeta.weakChildren).length === 0 ?
                                                        "-"
                                                        :
                                                        Object.keys(blockMeta.weakChildren ?? {})
                                                            .map((parent, _) => (
                                                                <ShortID
                                                                    hasSlot={true} marginTop={true}
                                                                    linkType={LinkType.Block} key={parent}
                                                                    network={network} id={parent}
                                                                />
                                                            ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col fill margin-b-s">
                                            <div className="section--data">
                                                <div className="label">Liked Instead Children</div>
                                                <div className="value">
                                                    {Object.keys(blockMeta.likedInsteadChildren).length === 0 ?
                                                        "-"
                                                        :
                                                        Object.keys(blockMeta.likedInsteadChildren ?? {})
                                                            .map(parent => (
                                                                <ShortID
                                                                    hasSlot={true} marginTop={true}
                                                                    linkType={LinkType.Block} key={parent}
                                                                    network={network} id={parent}
                                                                />
                                                            ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section">
                                    {block.payloadType.toString() === "GenericDataPayloadType(0)" && (
                                        <div>
                                            <div className="section--header">
                                                <div className="row middle">
                                                    <h2>Data Payload</h2>
                                                </div>
                                            </div>
                                            <div className="row row--tablet-responsive fill margin-b-s">
                                                <div className="col fill margin-b-s">
                                                    <div className="section--data">
                                                        <div className="label">Data</div>
                                                        <div className="value">
                                                            {(block.payload) ?? "Empty"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="section">
                                    {
                                        block.transactionID &&
                                        <BlockTransaction network={network} txId={block.transactionID} />
                                    }
                                </div>
                            </TabbedSection>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

BlockPage.defaultProps = {};

export default BlockPage;
