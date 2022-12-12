import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import "./EpochPage.scss";
import metadataMessage from "../../../assets/modals/stardust/block/metadata.json";
import { useEpoch, useEpochBlocks, useEpochTxs, useEpochVotersWeight } from "../../../helpers/proto/useEpoch";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import ShortID, { LinkType } from "./ShortID";

interface EpochPageProps {
    network: string;
    epochId: string;
}

const EpochPage: React.FC<RouteComponentProps<EpochPageProps>> = (
    { history, match: { params: { network, epochId } } }
) => {
    const [epoch, isEpochLoading] = useEpoch(network, epochId);
    const [txs, areTxsLoading] = useEpochTxs(network, epochId);
    const [blocks, areBlocksLoading] = useEpochBlocks(network, epochId);
    const [voters, areVotersLoading] = useEpochVotersWeight(network, epochId);

    if (isEpochLoading || !epoch) {
        return <div />;
    }

    return (
        <div className="epoch-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header row space-between">
                        <div className="row middle">
                            <h1>Epoch {epoch.index}</h1>
                            <Modal icon="info" data={metadataMessage} />
                        </div>
                        <div className="section--data row middle">
                            <button
                                className="milestone-action margin-r-t"
                                type="button"
                                disabled={!epoch.previousRoot}
                                onClick={() => history?.push(`/${network}/epoch/${epoch.previousRoot}`)}
                            >
                                <span>Previous</span>
                            </button>
                            <button
                                className="milestone-action margin-r-t"
                                type="button"
                                disabled={!epoch.nextRoot}
                                onClick={() => history?.push(`/${network}/epoch/${epoch.nextRoot}`)}
                            >
                                <span>Next</span>
                            </button>
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
                                                Commitment
                                            </div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={epoch.commitment}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Committed</div>
                                            <div className="value">{epoch.committed ? "true" : "false"}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Cumulative Stake</div>
                                            <div className="value">{epoch.cumulativeStake}</div>
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
                                                    network={network} id={epoch.commitmentRoot}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Tangle Root</div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={epoch.tangleRoot}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">State Root</div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={epoch.stateRoot}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Previous Root</div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={epoch.previousRoot}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">State Mutation Root</div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={epoch.stateMutationRoot}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Mana Root</div>
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={epoch.manaRoot}
                                                    linkType={LinkType.None} hasEpoch={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--header">
                                            <h2>Voters - {Object.keys(voters?.voters ?? {}).length}</h2>
                                            {areVotersLoading && <Spinner />}
                                        </div>
                                        <div className="section--data">
                                            <div className="value">
                                                {blocks?.blocks.map((parent, _) => (
                                                    <ShortID
                                                        marginTop={true}
                                                        linkType={LinkType.None} key={parent}
                                                        network={network} id={parent}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--header">
                                            <h2>Blocks - {blocks?.blocks.length}</h2>
                                            {areBlocksLoading && <Spinner />}
                                        </div>
                                        <div className="section--data">
                                            <div className="value">
                                                {blocks?.blocks.map((blockId, _) => (
                                                    <ShortID
                                                        hasEpoch={true} marginTop={true}
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

EpochPage.defaultProps = {};

export default EpochPage;
