/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import Modal from "../../components/Modal";
import taggedDataPayloadMessage from "./../../../assets/modals/stardust/block/tagged-data-payload.json";
import DataToggle from "./../DataToggle";
import { TaggedDataPayloadProps } from "./TaggedDataPayloadProps";
import { TaggedDataPayloadState } from "./TaggedDataPayloadState";

/**
 * Component which will display a indexation payload.
 */
class TaggedDataPayload extends Component<TaggedDataPayloadProps, TaggedDataPayloadState> {
    /**
     * Create a new instance of IndexationPayload.
     * @param props The props.
     */
    constructor(props: TaggedDataPayloadProps) {
        super(props);
        this.state = {
            hexIndex: this.props.payload.tag,
            hexData: this.props.payload.data
        };
    }

    public componentDidUpdate(prevProps: TaggedDataPayloadProps): void {
        if (prevProps.payload !== this.props.payload) {
            this.setState({
                hexIndex: this.props.payload.tag,
                hexData: this.props.payload.data
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { network, payload } = this.props;
        const { hexIndex, hexData } = this.state;

        return (
            <div>
                <div className="section--header">
                    <div className="row middle">
                        <h2>
                            Tagged Data Payload
                        </h2>
                        <Modal icon="info" data={taggedDataPayloadMessage} />
                    </div>
                </div>
                <div className="section--data">
                    <div className="label row middle">
                        <span className="margin-r-t">Tag</span>
                    </div>
                    <DataToggle
                        sourceData={hexIndex}
                        link={`/${network}/indexed/${payload.tag}`}
                        withSpacedHex={true}
                    />

                    {hexData && (
                        <React.Fragment>
                            <div className="label row middle">
                                <span className="margin-r-t">Data</span>
                            </div>
                            <DataToggle
                                sourceData={hexData}
                                withSpacedHex={true}
                            />
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}

export default TaggedDataPayload;

