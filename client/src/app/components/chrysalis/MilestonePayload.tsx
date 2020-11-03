/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import { DateHelper } from "../../../helpers/dateHelper";
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
                        Inclusion Merkle Proof
                    </div>
                    <div className="card--value">
                        {this.props.payload.inclusionMerkleProof}
                    </div>
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
