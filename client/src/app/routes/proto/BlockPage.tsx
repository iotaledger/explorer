import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import "./BlockPage.scss";
import metadataMessage from "../../../assets/modals/stardust/block/metadata.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBlockMetadataResponse } from "../../../models/api/proto/IBlockMetadataResponse";
import { IBlockResponse } from "../../../models/api/proto/IBlockResponse";
import { PROTO } from "../../../models/config/protocolVersion";
import { ProtoApiClient } from "../../../services/proto/protoApiClient";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";

interface BlockPageProps {
    network: string;
    blockId: string;
}

const BlockPage: React.FC<RouteComponentProps<BlockPageProps>> = (
    { history, match: { params: { network, blockId } } }
) => {
    const [isLoading, setIsLoading] = useState(true);
    const [block, setBlock] = useState<IBlockResponse | null>(null);
    const [blockMeta, setBlockMeta] = useState<IBlockMetadataResponse | null>(null);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const fetchedBlock = await apiClient.block({ id: blockId });
            setBlock(fetchedBlock);
            if (fetchedBlock.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setBlock({
                    epochCommitment: "0x123",
                    error: "",
                    id: "0x4af647910ba47000108b87c63abe0545643f9b203eacee2b713729b0450983fe",
                    issuerPublicKey: "0xa921841628d64c3f08bd344118b8106ade072e68c774beff30135e036194493a",
                    issuingTime: 1337,
                    latestConfirmedEpoch: 345,
                    nonce: "2342342342394890234",
                    parents: [
                        "0x16ee3356c21e410a0aaab42896021b1a857eb8d97a14a66fed9b13d634c21317",
                        "0x1df26178a7914126fd8cb934c7a7437073794c1c8ce99319172436b1d4973eba"
                    ],
                    payloadBytes: "",
                    sequenceNumber: 9001,
                    signature: "",
                    version: 1
                });
            }
            setIsLoading(false);
        })();
        return () => setBlock(null);
    }, [blockId]);

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const fetchedBlockMeta = await apiClient.blockMeta({ id: blockId });
            setBlockMeta(fetchedBlockMeta);
            if (fetchedBlockMeta.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setBlockMeta({
                    accepted: false,
                    acceptedTime: 0,
                    addedConflictIDs: [],
                    booked: false,
                    bookedTime: 0,
                    confirmed: false,
                    confirmedByEpoch: false,
                    confirmedTime: false,
                    conflictIDs: [],
                    dropped: false,
                    error: "",
                    id: "",
                    invalid: false,
                    likedInsteadChildren: [],
                    orphaned: false,
                    orphanedBlocksInPastCone: [],
                    scheduled: false,
                    schedulerTime: 0,
                    skipped: false,
                    solid: false,
                    solidTime: 0,
                    strongChildren: [],
                    structureDetails: undefined,
                    subjectivelyInvalid: false,
                    subtractedConflictIDs: [],
                    tracked: false,
                    trackedTime: 0,
                    weakChildren: []
                });
            }
            setIsLoading(false);
        })();
        return () => setBlock(null);
    }, [blockId]);

    return (
        <div className="block-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header row space-between">
                        <div className="row middle">
                            <h1>Block</h1>
                            <Modal icon="info" data={metadataMessage} />
                            {isLoading && <Spinner />}
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
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">
                                                ID
                                            </div>
                                            <div className="value">{block?.id}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">
                                                Issuer Public Key
                                            </div>
                                            <div className="value">{block?.issuerPublicKey}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">version</div>
                                            <div className="value">{block?.version}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">
                                                Sequence Number
                                            </div>
                                            <div className="value">{block?.sequenceNumber}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Issuing Time</div>
                                            <div className="value">{block?.issuingTime}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">
                                                Nonce
                                            </div>
                                            <div className="value">{block?.nonce}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Epoch</h2>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Commitment</div>
                                            <div className="value">{block?.epochCommitment}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Latest Confirmed Epoch</div>
                                            <div className="value">{block?.latestConfirmedEpoch}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Metadata</h2>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Commitment</div>
                                            <div className="value">{block?.epochCommitment}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Latest Confirmed Epoch</div>
                                            <div className="value">{block?.latestConfirmedEpoch}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Parents</h2>
                                    </div>
                                </div>
                                <div className="row middle">
                                    <div className="section--data">
                                        {block?.parents.map((parent, idx) => (
                                            <div
                                                key={idx}
                                                style={{ marginTop: "8px" }}
                                                className="value code link"
                                            >
                                                <div
                                                    className="pointer"
                                                    onClick={() => history.replace(
                                                        `/${network}/block/${parent}`
                                                    )}
                                                >
                                                    {parent}
                                                </div>
                                            </div>
                                        ))}
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

BlockPage.defaultProps = {};

export default BlockPage;
