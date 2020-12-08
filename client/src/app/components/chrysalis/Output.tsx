/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { UnitsHelper } from "../../../helpers/unitsHelper";
import MessageButton from "../MessageButton";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";

/**
 * Component which will display an output.
 */
class Output extends Component<OutputProps, OutputState> {
    /**
     * Create a new instance of Output.
     * @param props The props.
     */
    constructor(props: OutputProps) {
        super(props);

        this.state = {
            formatFull: false,
            isGenesis: props.output.messageId === "0".repeat(64)
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="output">
                <div className="card--header">
                    <h2>{this.props.output.output.type === 0 ? "Signature Locked" : ""} Output</h2>
                </div>
                <div className="card--content">
                    <div className="card--label">
                        Message Id
                    </div>
                    <div className="card--value row middle">
                        {this.state.isGenesis && (
                            <span>Genesis</span>
                        )}
                        {!this.state.isGenesis && (
                            <React.Fragment>
                                <Link
                                    to={
                                        `/${this.props.network
                                        }/message/${this.props.output.messageId}`
                                    }
                                    className="margin-r-t"
                                >
                                    {this.props.output.messageId}
                                </Link>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.props.output.messageId
                                    )}
                                    buttonType="copy"
                                    labelPosition="top"
                                />
                            </React.Fragment>
                        )}
                    </div>
                    <div className="card--label">
                        Transaction Id
                    </div>
                    <div className="card--value row middle">
                        {this.state.isGenesis && (
                            <span>Genesis</span>
                        )}
                        {!this.state.isGenesis && (
                            <React.Fragment>
                                <span className="margin-r-t">
                                    {this.props.output.transactionId}
                                </span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.props.output.transactionId
                                    )}
                                    buttonType="copy"
                                    labelPosition="top"
                                />
                            </React.Fragment>
                        )}
                    </div>
                    <div className="card--label">
                        Index
                    </div>
                    <div className="card--value">
                        {this.props.output.outputIndex}
                    </div>
                    <div className="card--label">
                        Is Spent
                    </div>
                    <div className="card--value">
                        {this.props.output.isSpent ? "Yes" : "No"}
                    </div>
                    {this.props.output.output.type === 0 && (
                        <React.Fragment>
                            <div className="card--label">
                                Amount
                            </div>
                            <div className="card--value">
                                <button
                                    type="button"
                                    onClick={() => this.setState(
                                        {
                                            formatFull: !this.state.formatFull
                                        }
                                    )}
                                >
                                    {this.state.formatFull
                                        ? `${this.props.output.output.amount} i`
                                        : UnitsHelper.formatBest(this.props.output.output.amount)}
                                </button>
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}

export default Output;
