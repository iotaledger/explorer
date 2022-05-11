/* eslint-disable max-len */
import { Converter } from "@iota/util.js-stardust";
import React, { Component, ReactNode } from "react";
import { TextHelper } from "../../../helpers/textHelper";
import Modal from "../../components/Modal";
import { ModalIcon } from "../ModalProps";
import messageJSON from "./../../../assets/modals/message.json";
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
        this.state = this.loadPayload();
    }

    public componentDidUpdate(prevProps: TaggedDataPayloadProps): void {
        if (prevProps.payload !== this.props.payload) {
            this.setState(this.loadPayload());
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const TOGGLE_INDEX_OPTIONS = this.state.utf8Index ? [
            {
                label: "Text", content: this.state.utf8Index,
                link: `/${this.props.network}/indexed/${this.props.payload.tag}`
            },
            {
                label: "HEX",
                content: this.state.hexIndex
            }
        ]
            : [
                {
                    label: "HEX",
                    link: `/${this.props.network}/indexed/${this.props.payload.tag}`,
                    content: this.state.hexIndex
                }
            ];

        const TOGGLE_DATA_OPTIONS = [
            {
                label: this.state.jsonData ? "JSON" : "Text",
                content: this.state.jsonData ?? this.state.utf8Data,
                isJson: this.state.jsonData !== undefined
            },
            {
                label: "HEX",
                content: this.state.hexData
            }
        ];
        return (
            <div>
                <div className="section--header">
                    <div className="row middle">
                        <h2>
                            Tagged Data Payload
                        </h2>
                        <Modal icon={ModalIcon.Info} data={messageJSON} />
                    </div>
                </div>
                <div className="section--data">
                    {TOGGLE_INDEX_OPTIONS.some(option => option.content !== undefined) && (
                        <React.Fragment>
                            <div className="label row middle">
                                <span className="margin-r-t">Index</span>
                            </div>
                            <DataToggle options={TOGGLE_INDEX_OPTIONS} />
                        </React.Fragment>
                    )}

                    {TOGGLE_DATA_OPTIONS.some(option => option.content !== undefined) && (
                        <React.Fragment>
                            <div className="label row middle">
                                <span className="margin-r-t">Data</span>
                            </div>
                            <DataToggle
                                options={TOGGLE_DATA_OPTIONS}
                            />
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }

    /**
     * Load index and data from payload.
     * @returns Object with indexes and data in raw and utf-8 format.
     */
    private loadPayload() {
        const tag = this.props.payload.tag ? this.props.payload.tag : "";
        const utf8Index = TextHelper.isUTF8(Converter.hexToBytes(tag)) ? Converter.hexToUtf8(tag) : undefined;
        const matchHexIndex = tag.match(/.{1,2}/g);
        const hexIndex = matchHexIndex ? matchHexIndex.join(" ") : tag;

        let hexData;
        let utf8Data;
        let jsonData;

        if (this.props.payload.data) {
            const matchHexData = this.props.payload.data.match(/.{1,2}/g);

            hexData = matchHexData ? matchHexData.join(" ") : this.props.payload.data;
            utf8Data = TextHelper.isUTF8(Converter.hexToBytes(this.props.payload.data)) ? Converter.hexToUtf8(this.props.payload.data) : undefined;

            try {
                if (utf8Data) {
                    jsonData = JSON.stringify(JSON.parse(utf8Data), undefined, "  ");
                }
            } catch { }
        }
        return {
            utf8Index,
            hexIndex,
            utf8Data,
            hexData,
            jsonData
        };
    }
}

export default TaggedDataPayload;

