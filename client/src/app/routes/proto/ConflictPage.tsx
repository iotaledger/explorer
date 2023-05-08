import { ConfirmationState } from "@iota/protonet.js";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useConflict } from "../../../helpers/proto/useConflict";
import "./ConflictPage.scss";
import { useConflictChildren } from "../../../helpers/proto/useConflictChildren";
import { useConflictConflicts } from "../../../helpers/proto/useConflictConflicts";
import { useConflictVoters } from "../../../helpers/proto/useConflictVoters";
import Spinner from "../../components/Spinner";
import ShortID, { LinkType } from "./ShortID";

interface ConflictPageProps {
    network: string;
    conflictId: string;
}

const ConflictPage: React.FC<RouteComponentProps<ConflictPageProps>> = (
    { match: { params: { network, conflictId } } }
) => {
    const [conflict, isConflictLoading] = useConflict(network, conflictId);
    const [children] = useConflictChildren(network, conflictId);
    const [conflicts] = useConflictConflicts(network, conflictId);
    const [voters] = useConflictVoters(network, conflictId);

    console.log(children);
    console.log(voters);

    if (isConflictLoading || !conflict) {
        return (
            <div className="conflict-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="conflict-page--header">
                            <div className="row row--tablet-responsive middle space-between middle">
                                <div className="row middle">
                                    <h1>Conflict <Spinner /></h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="conflict-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="conflict-page--header">
                        <div className="row row--tablet-responsive middle space-between middle">
                            <div className="row middle">
                                <h1>Conflict</h1>
                            </div>
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
                                            <div className="value">
                                                <ShortID
                                                    network={network} id={conflict.id}
                                                    linkType={LinkType.None} hasSlot={false}
                                                />
                                            </div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">Parents</div>
                                            <div className="value">
                                                {conflict.parents.length === 0 ?
                                                    "-"
                                                    :
                                                    conflict.parents.map((parent, _) => (
                                                        <ShortID
                                                            hasSlot={false} marginTop={true}
                                                            linkType={LinkType.Conflict} key={parent}
                                                            network={network} id={parent}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Voters</div>
                                            <div className="value">
                                                {voters?.voters.length === 0 ?
                                                    "-"
                                                    :
                                                    voters?.voters.map((voter, _) => (
                                                        <ShortID
                                                            hasSlot={false} marginTop={true}
                                                            linkType={LinkType.None} key={voter}
                                                            network={network} id={voter}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                        <div className="section--data">
                                            <div className="label">Children</div>
                                            <div className="value">
                                                {children?.childConflicts.length === 0 ?
                                                    "-"
                                                    :
                                                    children?.childConflicts.map((childConflict, _) => (
                                                        <ShortID
                                                            hasSlot={false} marginTop={true}
                                                            linkType={LinkType.Conflict} key={childConflict.conflictID}
                                                            network={network} id={childConflict.conflictID}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="label">Confirmation state</div>
                                            <div className="value">
                                                {ConfirmationState[conflict.confirmationState]}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="section--header">
                                    <div className="row middle">
                                        <h2>Conflicts</h2>
                                    </div>
                                </div>
                                <div className="row row--tablet-responsive fill margin-b-s">
                                    <div className="col fill margin-b-s">
                                        <div className="section--data">
                                            <div className="value">
                                                {conflicts?.conflicts.length === 0 ?
                                                    "-"
                                                    :
                                                    conflicts?.conflicts.map((linkedConflict, _) => (
                                                        <div key={linkedConflict.outputID.base58}>
                                                            <p>Output ID</p>
                                                            <ShortID
                                                                hasSlot={false} marginTop={true}
                                                                linkType={LinkType.Output}
                                                                network={network} id={linkedConflict.outputID.base58}
                                                            />
                                                            <p className="margin-b-s margin-t-s">On</p>
                                                            {linkedConflict.conflictIDs.map(linkedConflictId => (
                                                                <ShortID
                                                                    key={linkedConflictId}
                                                                    hasSlot={false} marginTop={true}
                                                                    linkType={LinkType.Conflict}
                                                                    network={network} id={linkedConflictId}
                                                                />))}
                                                            <p className="margin-b-s margin-t-s">---</p>
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
            </div>
        </div>
    );
};

export default ConflictPage;
