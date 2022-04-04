/* eslint-disable max-len */
import { BASIC_OUTPUT_TYPE, UnitsHelper } from "@iota/iota.js-stardust";
import { WriteStream } from "@iota/util.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import MessageButton from "../MessageButton";
import { OutputState } from "../OutputState";
import { OutputProps } from "./OutputProps";

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

        const GENESIS_HASH = "0".repeat(64);

        const writeStream = new WriteStream();
        writeStream.writeUInt16("transactionId", props.output.outputIndex);

        this.state = {
            formatFull: false,
            isGenesis: props.output.messageId === GENESIS_HASH,
            outputHash: props.output.transactionId + writeStream.finalHex()
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
                    <h2>{this.props.advancedMode ? NameHelper.getOutputTypeName(this.props.output.output.type) : "Output"} {this.props.index}</h2>
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
                    {this.props.advancedMode && (
                        <React.Fragment>
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
                                            <Link
                                                to={
                                                    `/${this.props.network
                                                }/search/${this.state.outputHash}`
                                                }
                                                className="margin-r-t"
                                            >
                                                {this.props.output.transactionId}
                                            </Link>
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
                        </React.Fragment>
                    )}
                    {(this.props.output.output.type === BASIC_OUTPUT_TYPE) && (
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
                                        : UnitsHelper.formatBest(Number(this.props.output.output.amount))}
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

