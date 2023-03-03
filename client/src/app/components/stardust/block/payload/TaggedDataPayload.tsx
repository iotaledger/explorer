/* eslint-disable max-len */
import React, { Component, ReactNode } from "react";
import DataToggle from "../../../DataToggle";
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
        const { hexIndex, hexData } = this.state;

        return (
            <div>
                <div className="section--data">
                    <div className="label row middle">
                        <span className="margin-r-t">Tag</span>
                    </div>
                    <DataToggle
                        sourceData={hexIndex}
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

