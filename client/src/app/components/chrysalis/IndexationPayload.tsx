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

        const utf8Index = Converter.hexToUtf8(props.payload.index);
        const matchHexIndex = props.payload.index.match(/.{1,2}/g);
        const hexIndex = matchHexIndex ? matchHexIndex.join(" ") : props.payload.index;

        let hexData;
        let utf8Data;
        let jsonData;

        if (props.payload.data) {
            const matchHexData = props.payload.data.match(/.{1,2}/g);

            hexData = matchHexData ? matchHexData.join(" ") : props.payload.data;
            utf8Data = Converter.hexToUtf8(props.payload.data);

            try {
                jsonData = JSON.stringify(JSON.parse(utf8Data), undefined, "  ");
            } catch { }
        }

        this.state = {
            utf8Index,
            hexIndex,
            utf8Data,
            hexData,
            jsonData
        };
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
                    <div className="card--label row middle">
                        <span className="margin-r-t">Index UTF8</span>
                        <MessageButton
                            onClick={() => ClipboardHelper.copy(
                                this.state.utf8Index
                            )}
                            buttonType="copy"
                            labelPosition="right"
                        />
                    </div>
                    <div className="card--value">
                        <Link
                            to={
                                `/${this.props.network
                                }/indexed/${this.props.payload.index}`
                            }
                        >
                            {this.state.utf8Index}
                        </Link>
                    </div>
                    <div className="card--label row middle">
                        <span className="margin-r-t">Index Hex</span>
                        <MessageButton
                            onClick={() => ClipboardHelper.copy(
                                this.state.hexIndex.replace(/ /g, "")
                            )}
                            buttonType="copy"
                            labelPosition="right"
                        />
                    </div>
                    <div className="card--value card--value-textarea card--value-textarea__hex card--value-textarea__fit">
                        {this.state.hexIndex}
                    </div>
                    {!this.state.jsonData && this.state.utf8Data && (
                        <React.Fragment>
                            <div className="card--label row middle">
                                <span className="margin-r-t">Data UTF8</span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.state.utf8Data
                                    )}
                                    buttonType="copy"
                                    labelPosition="right"
                                />
                            </div>
                            <div className="card--value card--value-textarea card--value-textarea__utf8">
                                {this.state.utf8Data}
                            </div>
                        </React.Fragment>
                    )}
                    {this.state.jsonData && (
                        <React.Fragment>
                            <div className="card--label row middle">
                                <span className="margin-r-t">Data JSON</span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.state.jsonData
                                    )}
                                    buttonType="copy"
                                    labelPosition="right"
                                />
                            </div>
                            <div
                                className="card--value card--value-textarea card--value-textarea__json"
                            >
                                <JsonViewer json={this.state.jsonData} />
                            </div>
                        </React.Fragment>
                    )}
                    {this.state.hexData && (
                        <React.Fragment>
                            <div className="card--label row middle">
                                <span className="margin-r-t">Data Hex</span>
                                <MessageButton
                                    onClick={() => ClipboardHelper.copy(
                                        this.state.hexData?.replace(/ /g, "")
                                    )}
                                    buttonType="copy"
                                    labelPosition="right"
                                />
                            </div>
                            <div className="card--value card--value-textarea card--value-textarea__hex">
                                {this.state.hexData}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}

export default IndexationPayload;
