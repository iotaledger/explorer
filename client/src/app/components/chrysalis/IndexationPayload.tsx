/* eslint-disable max-len */
import { Converter } from "@iota/util.js";
import React, { Component, ReactNode } from "react";
import { TextHelper } from "../../../helpers/textHelper";
import Modal from "../../components/Modal";
import { ModalIcon } from "../ModalProps";
import messageJSON from "./../../../assets/modals/message.json";
import DataToggle from "./../DataToggle";
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

        const utf8Index = TextHelper.isUTF8(Converter.hexToBytes(props.payload.index)) ? Converter.hexToUtf8(props.payload.index) : undefined;
        const matchHexIndex = props.payload.index.match(/.{1,2}/g);
        const hexIndex = matchHexIndex ? matchHexIndex.join(" ") : props.payload.index;

        let hexData;
        let utf8Data;
        let jsonData;

        if (props.payload.data) {
            const matchHexData = props.payload.data.match(/.{1,2}/g);

            hexData = matchHexData ? matchHexData.join(" ") : props.payload.data;
            utf8Data = TextHelper.isUTF8(Converter.hexToBytes(props.payload.data)) ? Converter.hexToUtf8(props.payload.data) : undefined;

            try {
                if (utf8Data) {
                    jsonData = JSON.stringify(JSON.parse(utf8Data), undefined, "  ");
                }
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
        const TOGGLE_INDEX_OPTIONS = this.state.utf8Index ? [
            {
                label: "Text", content: this.state.utf8Index,
                link: `/${this.props.network}/indexed/${this.props.payload.index}`
            },
            {
                label: "HEX",
                content: this.state.hexIndex
            }
        ]
            : [
                {
                    label: "HEX",
                    link: `/${this.props.network}/indexed/${this.props.payload.index}`,
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
                            Indexation Payload
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
}

export default IndexationPayload;
