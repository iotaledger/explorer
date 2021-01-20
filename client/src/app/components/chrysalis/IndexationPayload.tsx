/* eslint-disable max-len */
import { Converter } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import JsonViewer from "../JsonViewer";
import MessageButton from "../MessageButton";
import { IndexationPayloadProps } from "./IndexationPayloadProps";
import { IndexationPayloadState } from "./IndexationPayloadState";

/**
 * Component which will display a indexation payload.
 */
class IndexationPayload extends Component<IndexationPayloadProps, IndexationPayloadState> {
    /**
     * Create a new instance of IndexationPayload.
     * @param props The props.
     */
    constructor(props: IndexationPayloadProps) {
        super(props);

        if (props.payload.data) {
            const match = props.payload.data.match(/.{1,2}/g);

            const utf8 = Converter.hexToUtf8(props.payload.data);

            let json;

            try {
                json = JSON.stringify(JSON.parse(utf8), undefined, "  ");
            } catch { }

            this.state = {
                hex: match ? match.join(" ") : props.payload.data,
                utf8,
                json
            };
        } else {
            this.state = {};
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="indexation-payload">
                <div className="card--header">
                    <h2>Indexation Payload</h2>
                </div>
                <div className="card--content">
                    <div className="card--label">
                        <span className="margin-r-t">Index</span>
                        <MessageButton
                            onClick={() => ClipboardHelper.copy(
                                this.props.payload.index
                            )}
                            buttonType="copy"
                            labelPosition="right"
                        />
                    </div>
                    <div className="card--value row middle">
                        <Link
                            className="margin-r-t"
                            to={
                                `/${this.props.network
                                }/indexed/${this.props.payload.index}`
                            }
                        >
                            {this.props.payload.index}
                        </Link>
                    </div>
                    {!this.state.json && this.state.utf8 && (
                        <React.Fragment>
                            <div className="card--label row middle">
                                <span className="margin-r-t">Data Text</span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.state.utf8
                                    )}
                                    buttonType="copy"
                                    labelPosition="right"
                                />
                            </div>
                            <div className="card--value card--value-textarea card--value-textarea__utf8">
                                {this.state.utf8}
                            </div>
                        </React.Fragment>
                    )}
                    {this.state.json && (
                        <React.Fragment>
                            <div className="card--label row middle">
                                <span className="margin-r-t">Data JSON</span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.state.json
                                    )}
                                    buttonType="copy"
                                    labelPosition="right"
                                />
                            </div>
                            <div
                                className="card--value card--value-textarea card--value-textarea__json"
                            >
                                <JsonViewer json={this.state.json} />
                            </div>
                        </React.Fragment>
                    )}
                    {this.state.hex && (
                        <React.Fragment>
                            <div className="card--label row middle">
                                <span className="margin-r-t">Data Hex</span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.state.hex
                                    )}
                                    buttonType="copy"
                                    labelPosition="right"
                                />
                            </div>
                            <div className="card--value card--value-textarea card--value-textarea__hex">
                                {this.state.hex}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}

export default IndexationPayload;
