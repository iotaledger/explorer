import { ConfirmationState } from "@iota/protonet.js";
import moment from "moment";
import React from "react";
import { useTx } from "../../../helpers/proto/useTx";
import { useTxMeta } from "../../../helpers/proto/useTxMeta";
import TransactionPayload from "../../components/proto/TransactionPayload";
import ShortID, { LinkType } from "../../routes/proto/ShortID";

interface TransactionProps {
    network: string;
    txId: string;
}

const Transaction: React.FC<TransactionProps> = ({ network, txId }) => {
    const [tx, isTxLoading] = useTx(network, txId);
    const [txMeta, isTxMetaLoading] = useTxMeta(network, txId);

    if (isTxLoading || isTxMetaLoading || !tx || !txMeta) {
        return <div />;
    }

    return (
        <React.Fragment>
            <div className="section--header row row--tablet-responsive middle space-between">
                <div className="row middle">
                    <h2>General</h2>
                </div>
            </div>
            <div className="row row--tablet-responsive fill margin-b-s">
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">ID</div>
                        <div className="value">
                            <ShortID
                                hasEpoch={false} linkType={LinkType.Transaction}
                                network={network} id={txId}
                            />
                        </div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Version</div>
                        <div className="value">{tx.version}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Timestamp</div>
                        <div className="value">{moment(tx.timestamp * 1000).format()}</div>
                    </div>
                </div>
            </div>
            <div className="row row--tablet-responsive fill margin-b-s">
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Access Pledge ID</div>
                        <div className="value">{tx.accessPledgeID}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Consensus Pledge ID</div>
                        <div className="value">{tx.consensusPledgeID}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s" />
            </div>
            <div className="section--header">
                <div className="row middle">
                    <h2>Metadata</h2>
                </div>
            </div>
            <div className="row row--tablet-responsive fill margin-b-s">
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Booked</div>
                        <div className="value text-truncate">{txMeta.booked ? "true" : "false"}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Booked Time</div>
                        <div className="value">{moment(txMeta.bookedTime * 1000).format()}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s" />
            </div>
            <div className="row row--tablet-responsive fill margin-b-s">
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Confirmation State</div>
                        <div className="value text-truncate">{ConfirmationState[txMeta.confirmationState ?? 0]}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Confirmation State Time</div>
                        <div className="value">{moment(txMeta.confirmationStateTime * 1000).format()}</div>
                    </div>
                </div>
                <div className="col fill margin-b-s">
                    <div className="section--data">
                        <div className="label">Conflict IDs</div>
                        <div className="value">
                            {txMeta?.conflictIDs.map((conflictID, _) => (
                                <ShortID
                                    hasEpoch={false} linkType={LinkType.Conflict}
                                    key={conflictID}
                                    network={network} id={conflictID}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <TransactionPayload tx={tx} network={network} />
        </React.Fragment>
    );
};

export default Transaction;
