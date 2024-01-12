/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import indexationMessage from "~assets/modals/chrysalis/message/indexation-payload.json";
import DataToggle from "./../DataToggle";
import { IndexationPayloadProps } from "./IndexationPayloadProps";
import { IndexationPayloadState } from "./IndexationPayloadState";
import Modal from "../../components/Modal";


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
        this.state = {
            hexIndex: this.props.payload.index,
            hexData: this.props.payload.data
        };
    }

    public componentDidUpdate(prevProps: IndexationPayloadProps): void {
        if (prevProps.payload !== this.props.payload) {
            this.setState({
                hexIndex: this.props.payload.index,
                hexData: this.props.payload.data
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div>
                <div className="section--header">
                    <div className="row middle">
                        <h2>
                            Indexation Payload
                        </h2>
                        <Modal icon="info" data={indexationMessage} />
                    </div>
                </div>
                <div className="section--data">
                    <div className="label row middle">
                        <span className="margin-r-t">Index</span>
                    </div>
                    <DataToggle
                        sourceData={this.state.hexIndex}
                        link={`/${this.props.network}/indexed/${this.props.payload.index}`}
                        withSpacedHex={true}
                    />

                    {this.state.hexData && (
                        <React.Fragment>
                            <div className="label row middle">
                                <span className="margin-r-t">Data</span>
                            </div>
                            <DataToggle
                                sourceData={this.state.hexData}
                                withSpacedHex={true}
                            />
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}

export default IndexationPayload;
