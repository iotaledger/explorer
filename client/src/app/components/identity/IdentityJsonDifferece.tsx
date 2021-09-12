/* eslint-disable @typescript-eslint/quotes */

import "./IdentityJsonDifference.scss";

import React, { Component, ReactNode } from "react";

import { DiffMessage } from "../../../models/api/IIdentityDiffHistoryResponse";
import { DownloadHelper } from "../../../helpers/downloadHelper";
import { HiDownload } from "react-icons/hi";
import IdentityCompareDropdown from "./IdentityCompareDropdown";
import { IdentityJsonDifferenceProps } from "./IdentityJsonDifferenceProps";
import { IdentityJsonDifferenceState } from "./IdentityJsonDifferenceState";
import IdentityMessageIdOverview from "./IdentityMsgIdOverview";
import JsonViewer from "../JsonViewer";
import ReactDiffViewer from "react-diff-viewer";
import chevronDownGray from "../../../assets/chevron-down-gray.svg";

class IdentityJsonDifference extends Component<IdentityJsonDifferenceProps, IdentityJsonDifferenceState> {
    constructor(props: IdentityJsonDifferenceProps) {
        super(props);

        this.state = {
            selectedComparedContent: undefined
        };
    }

    public render(): ReactNode {
        return (
            <div>
                {/* --------- Header of JsonViewer --------- */}
                <div className="identity-json-header">
                    <div className="compare-elements">
                        <IdentityMessageIdOverview
                            status={(this.props.content as DiffMessage).diff ? "diff" : "integration"}
                            messageId={this.props.messageId}
                            onClick={() => {
                                //todo
                                // this.props.history.push(
                                //     // eslint-disable-next-line max-len
                                //     `/${this.props.match.params.network}/message/${this.state.selectedMessageId}`
                                // );
                            }}
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="10" height="10" rx="2" stroke="#BDBDBD" strokeWidth="2" />
                            <rect x="9" y="9" width="10" height="10" rx="2" stroke="#BDBDBD" strokeWidth="2" />
                            <path
                                // eslint-disable-next-line max-len
                                d="M15.9999 8V13.9999C15.9999 15.1044 15.1044 15.9999 13.9999 15.9999H8V10C8 8.89543 8.89543 8 10 8H15.9999Z"
                                fill="#BDBDBD"
                            />
                        </svg>
                        <IdentityCompareDropdown
                            messages={
                                this.props.compareWith ?? []
                                //     [
                                //     { messageId: "zxc654zxc6v54zxc6v54zxcv8zxc4v", content: undefined },
                                //     { messageId: "al;skdfj;alsdkfj", content: undefined }
                                // ]
                            }
                            onSelectionChange={(messageId, content) => {
                                this.setState({
                                    selectedComparedMessageId: messageId,
                                    selectedComparedContent: content
                                });
                            }}
                        />
                    </div>

                    <a
                        href={DownloadHelper.createJsonDataUrl(this.props.content)}
                        download={DownloadHelper.filename(this.props.messageId, "json")}
                        role="button"
                    >
                        <HiDownload />
                    </a>
                </div>

                {/* --------- JsonViewer --------- */}
                <div
                    className="
                    card--value
                    card--value-textarea
                    card--value-textarea__json"
                >
                    <ReactDiffViewer
                        newValue={JSON.stringify(this.props.content, null, 4)}
                        oldValue={
                            this.state.selectedComparedContent
                                ? JSON.stringify(this.state.selectedComparedContent, null, 4)
                                : JSON.stringify(this.props.content, null, 4)
                        }
                        splitView={false}
                        disableWordDiff={true}
                        renderContent={this.highlightSyntax}
                        hideLineNumbers={true}
                        showDiffOnly={false}
                        styles={{
                            variables: {
                                light: {
                                    diffViewerBackground: "#f2f5fb"
                                }
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    private readonly highlightSyntax = (str: string) => {
        console.log(str);
        return (
            <span
                style={{ display: "inline" }}
                dangerouslySetInnerHTML={{
                    __html: this.syntaxHighlight(str)
                }}
            />
        );
    };

    private syntaxHighlight(json: string): string {
        return json
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(
                // eslint-disable-next-line max-len
                /("(\\u[\dA-Za-z]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[Ee][+-]?\d+)?)/g,
                match => {
                    let cls = "number";
                    if (match.startsWith('"')) {
                        cls = match.endsWith(":") ? "key" : "string";
                    } else if (/true|false/.test(match)) {
                        cls = "boolean";
                    } else if (match.includes("null")) {
                        cls = "null";
                    }
                    return `<span class="${cls}">${match}</span>`;
                }
            );
    }
}

export default IdentityJsonDifference;
