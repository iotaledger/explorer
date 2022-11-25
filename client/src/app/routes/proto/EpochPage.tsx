import React, { useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import "./EpochPage.scss";
import metadataMessage from "../../../assets/modals/stardust/block/metadata.json";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IEpochResponse } from "../../../models/api/proto/IEpochResponse";
import { PROTO } from "../../../models/config/protocolVersion";
import { ProtoApiClient } from "../../../services/proto/protoApiClient";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";

interface EpochPageProps {
    network: string;
    epochId: string;
}

const EpochPage: React.FC<RouteComponentProps<EpochPageProps>> = (
    { history, match: { params: { network, epochId } } }
) => {
    const [isLoading, setIsLoading] = useState(true);
    const [epoch, setEpoch] = useState<IEpochResponse | null>(null);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const fetchedEpoch = await apiClient.epoch({ id: epochId });
            setEpoch(fetchedEpoch);
            if (fetchedEpoch.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setEpoch({
                    index: 9001,
                    commitment: "0x123",
                    commitmentRoot: "0x123",
                    confirmed: true,
                    cumulativeStake: 1234756734587693,
                    error: "",
                    manaRoot: "0x123",
                    numAcceptedBlocks: 56,
                    numAcceptedTxs: 12,
                    numActiveValidators: 8,
                    previousRoot: "0x123",
                    nextRoot: "0x321",
                    stateMutationRoot: "0x123",
                    stateRoot: "0x123",
                    tangleRoot: "0x123",
                    timestamp: 1337
                });
            }
            setIsLoading(false);
        })();
        return () => setEpoch(null);
    }, [epochId]);

    return (
        <div className="epoch-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="block--header row space-between">
                        <div className="row middle">
                            <h1>Epoch {epoch?.index}</h1>
                            <Modal icon="info" data={metadataMessage} />
                            {isLoading && <Spinner />}
                        </div>
                        <div className="section--data row middle">
                            <button
                                className="milestone-action margin-r-t"
                                type="button"
                                disabled={!epoch?.previousRoot}
                                onClick={() => history?.push(`/${network}/epoch/${epoch?.previousRoot}`)}
                            >
                                <span>Previous</span>
                            </button>
                            <button
                                className="milestone-action margin-r-t"
                                type="button"
                                disabled={!epoch?.nextRoot}
                                onClick={() => history?.push(`/${network}/epoch/${epoch?.nextRoot}`)}
                            >
                                <span>Next</span>
                            </button>
                        </div>
                    </div>
                    <div className="block--header row space-between">
                        <div className="row middle">
                            <button
                                className="milestone-action margin-r-t"
                                type="button"
                                disabled={!epoch?.previousRoot}
                                onClick={() => history?.push(`/${network}/block/0x123`)}
                            >
                                <span>To Block</span>
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
                                            <div className="value">{epoch?.commitment}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Confirmed</div>
                                            <div className="value">{epoch?.confirmed ? "true" : "false"}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Timestamp</div>
                                            <div className="value">{epoch?.timestamp}</div>
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
                                            <div className="value">{epoch?.commitmentRoot}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">Previous Root</div>
                                            <div className="value">{epoch?.previousRoot}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Tangle Root</div>
                                            <div className="value">{epoch?.tangleRoot}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">State Mutation Root</div>
                                            <div className="value">{epoch?.stateMutationRoot}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">State Root</div>
                                            <div className="value">{epoch?.stateRoot}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">Mana Root</div>
                                            <div className="value">{epoch?.manaRoot}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Stats</h2>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label"># Of Accepted Blocks</div>
                                            <div className="value">{epoch?.numAcceptedBlocks}</div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">Cumulative Stake</div>
                                            <div className="value">{epoch?.cumulativeStake}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label"># Of Active Validators</div>
                                            <div className="value">{epoch?.numActiveValidators}</div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label"># Of Accepted Transactions</div>
                                            <div className="value">{epoch?.numAcceptedTxs}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Validators</h2>
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="value code link">
                                        <Link to="" className="margin-r-t">
                                            123
                                        </Link>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Transactions</h2>
                                    </div>
                                </div>
                                <div className="section--data">
                                    <div className="value code link">
                                        <Link to="" className="margin-r-t">
                                            123
                                        </Link>
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
