/* eslint-disable max-len */
import { Converter } from "@iota/iota2.js";
import React, { Component, ReactNode } from "react";
import { TextHelper } from "../../../helpers/textHelper";
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

        const match = props.payload.data.match(/.{1,2}/g);

        const ascii = Converter.hexToAscii(props.payload.data);

        let json;

        try {
            const nonAscii = TextHelper.decodeNonASCII(ascii);
            if (nonAscii) {
                json = JSON.stringify(JSON.parse(nonAscii), undefined, "\t");
            }
        } catch { }

        this.state = {
            hex: match ? match.join(" ") : props.payload.data,
            ascii,
            json
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
                    <div className="card--label">
                        Index
                    </div>
                    <div className="card--value">
                        {this.props.payload.index}
                    </div>
                    {!this.state.json && (
                        <React.Fragment>
                            <div className="card--label">
                                Data ASCII
                            </div>
                            <div className="card--value card--value-textarea card--value-textarea__ascii">
                                {this.state.ascii}
                            </div>
                        </React.Fragment>
                    )}
                    {this.state.json && (
                        <React.Fragment>
                            <div className="card--label">
                                Data JSON
                            </div>
                            <div className="card--value card--value-textarea card--value-textarea__json">
                                {this.state.json}
                            </div>
                        </React.Fragment>
                    )}
                    <div className="card--label">
                        Data Hex
                    </div>
                    <div className="card--value card--value-textarea card--value-textarea__hex">
                        {this.state.hex}
                    </div>
                </div>
            </div>
        );
    }
}

export default IndexationPayload;
