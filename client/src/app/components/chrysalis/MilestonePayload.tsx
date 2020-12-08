/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { DateHelper } from "../../../helpers/dateHelper";
import MessageButton from "../MessageButton";
import { MilestonePayloadProps } from "./MilestonePayloadProps";

/**
 * Component which will display a milestone payload.
 */
class MilestonePayload extends Component<MilestonePayloadProps> {
    /**
     * Create a new instance of MilestonePayload.
     * @param props The props.
     */
    constructor(props: MilestonePayloadProps) {
        super(props);

        this.state = {
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="milestone-payload">
                <div className="card--header">
                    <h2>Milestone Payload</h2>
                </div>
                <div className="card--content">
                    <div className="card--label">
                        Index
                    </div>
                    <div className="card--value">
                        {this.props.payload.index}
                    </div>
                    <div className="card--label">
                        Date
                    </div>
                    <div className="card--value">
                        {this.props.payload.timestamp && DateHelper.format(
                            DateHelper.milliseconds(
                                this.props.payload.timestamp
                            )
                        )}
                    </div>
                    <div className="card--label">
                        Parent Message 1
                    </div>
                    <div className="card--value row middle">
                        <Link
                            className="margin-r-t"
                            to={
                                `/${this.props.network
                                }/message/${this.props.payload.parent1MessageId}`
                            }
                        >
                            {this.props.payload.parent1MessageId}
                        </Link>
                        <MessageButton
                            onClick={() => ClipboardHelper.copy(
                                this.props.payload.parent1MessageId
                            )}
                            buttonType="copy"
                            labelPosition="top"
                        />
                    </div>
                    <div className="card--label">
                        Parent Message 2
                    </div>
                    <div className="card--value row middle">
                        <Link
                            className="margin-r-t"
                            to={
                                `/${this.props.network
                                }/message/${this.props.payload.parent2MessageId}`
                            }
                        >
                            {this.props.payload.parent2MessageId}
                        </Link>
                        <MessageButton
                            onClick={() => ClipboardHelper.copy(
                                this.props.payload.parent2MessageId
                            )}
                            buttonType="copy"
                            labelPosition="top"
                        />
                    </div>
                    <div className="card--label">
                        Inclusion Merkle Proof
                    </div>
                    <div className="card--value">
                        {this.props.payload.inclusionMerkleProof}
                    </div>
                    {this.props.payload.publicKeys && (
                        <React.Fragment>
                            <div className="card--label">
                                Public Keys
                            </div>
                            <div className="card--value">
                                {this.props.payload.publicKeys?.map(pubKey => (
                                    <div key={pubKey} className="margin-b-s">
                                        {pubKey}
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    )}
                    <div className="card--label">
                        Signatures
                    </div>
                    <div className="card--value">
                        {this.props.payload.signatures.map(sig => (
                            <div key={sig} className="margin-b-s">
                                {sig}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default MilestonePayload;
