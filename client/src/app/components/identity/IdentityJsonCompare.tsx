import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import ReactDiffViewer from "react-diff-viewer";
import IdentityCompareDropdown from "./IdentityCompareDropdown";
import "./IdentityJsonCompare.scss";
import { IdentityJsonCompareProps } from "./IdentityJsonCompareProps";
import { IdentityJsonCompareState } from "./IdentityJsonCompareState";
import IdentityMessageIdOverview from "./IdentityMsgIdOverview";
import { DownloadHelper } from "~helpers/downloadHelper";
import { IdentityHelper } from "~helpers/identityHelper";
import { JsonSyntaxHelper } from "~helpers/jsonSyntaxHelper";

class IdentityJsonCompare extends Component<IdentityJsonCompareProps, IdentityJsonCompareState> {
    constructor(props: IdentityJsonCompareProps) {
        super(props);

        this.state = {
            toggleState: "doc"
        };
    }

    private get mode(): "diff" | "integration" {
        return this.props.selectedMessage?.isDiff ? "diff" : "integration";
    }

    public render(): ReactNode {
        return (
            <div className="container">
                {/* --------- Header of JsonViewer --------- */}
                <div className="identity-json-header">
                    <div className="compare-elements">
                        <IdentityMessageIdOverview
                            status={this.mode}
                            messageId={this.props.selectedMessage?.messageId}
                            onClick={() => {
                                // eslint-disable-next-line max-len
                                window.location.href = `/${this.props.network}/message/${this.props.selectedMessage?.messageId}`;
                            }}
                        />
                        {!(this.props.selectedMessage?.isDiff && this.state.toggleState === "msg") && (
                            <div>
                                <div className="row">
                                    <IdentityCompareDropdown
                                        messages={this.props.compareWith ?? []}
                                        selectedMessage={this.props.selectedComparisonMessage}
                                        onSelectionChange={selectedMessage => {
                                            this.props.onCompareSelectionChange(selectedMessage);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="row middle">
                        {/* --------- Toggle Button --------- */}
                        <div
                            className="toggle-box no-select"
                            onClick={e => {
                                this.setState({
                                    toggleState: this.state.toggleState === "doc" ? "msg" : "doc"
                                });
                                if (this.props.selectedMessage?.isDiff) {
                                    this.props.onCompareSelectionChange();
                                }
                            }}
                        >
                            <div
                                className={classNames("toggle-button", {
                                    "toggle-button-active": this.state.toggleState === "doc"
                                })}
                            >
                                Doc
                            </div>
                            <div className="toggle-separator" />
                            <div
                                className={classNames("toggle-button", {
                                    "toggle-button-active": this.state.toggleState === "msg"
                                })}
                            >
                                Msg
                            </div>
                        </div>
                        {/* --------- Download Icon --------- */}
                        <a
                            className="download-button"
                            href={DownloadHelper.createJsonDataUrl(
                                this.state.toggleState === "doc"
                                    ? this.props.selectedMessage?.document
                                    : this.props.selectedMessage?.message
                            )}
                            download={DownloadHelper.filename(
                                this.props.selectedMessage?.messageId ?? "message",
                                "json"
                            )}
                            role="button"
                        >
                            <svg
                                width="18"
                                height="17"
                                viewBox="0 0 18 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* eslint-disable-next-line max-len */}
                                <path d="M3.34921 8.47354C2.92988 8.11412 2.88132 7.48282 3.24074 7.06349C3.60017 6.64417 4.23147 6.59561 4.65079 6.95503L8 9.82578V1C8 0.447715 8.44771 0 9 0C9.55228 0 10 0.447715 10 1V9.82578L13.3492 6.95503C13.7685 6.59561 14.3998 6.64417 14.7593 7.0635C15.1187 7.48282 15.0701 8.11412 14.6508 8.47354L9 13.3171L3.34921 8.47354Z" fill="#485776" />
                                {/* eslint-disable-next-line max-len */}
                                <path d="M2 14C2 13.4477 1.55228 13 1 13C0.447715 13 0 13.4477 0 14V15C0 16.1046 0.895431 17 2 17H16C17.1046 17 18 16.1046 18 15V14C18 13.4477 17.5523 13 17 13C16.4477 13 16 13.4477 16 14V15H2V14Z" fill="#485776" />
                            </svg>

                        </a>
                    </div>
                </div>

                {/* --------- Json Compare Viewer --------- */}
                <div
                    className="
                    diff-wrapper
                    card--value
                    card--value-textarea
                    card--value-textarea__json"
                >
                    <ReactDiffViewer
                        newValue={JSON.stringify(
                            this.state.toggleState === "doc"
                                ? this.props.selectedMessage?.document.doc
                                : IdentityHelper.transformDocument(
                                    this.props.selectedMessage?.message,
                                    this.mode,
                                    this.props.version
                                ),
                            null,
                            4
                        )}
                        oldValue={
                            this.props.selectedComparisonMessage?.message &&
                                this.props.selectedComparisonMessage.document
                                ? JSON.stringify(
                                    this.state.toggleState === "doc"
                                        ? this.props.selectedComparisonMessage.document.doc
                                        : IdentityHelper.transformDocument(
                                            this.props.selectedComparisonMessage.message,
                                            this.mode,
                                            this.props.version
                                        ),
                                    null,
                                    4
                                )
                                : JSON.stringify(
                                    this.state.toggleState === "doc"
                                        ? this.props.selectedMessage?.document.doc
                                        : IdentityHelper.transformDocument(
                                            this.props.selectedMessage?.message,
                                            this.mode,
                                            this.props.version
                                        ),
                                    null,
                                    4
                                )
                        }
                        splitView={false}
                        disableWordDiff={true}
                        renderContent={this.highlightSyntax}
                        hideLineNumbers={true}
                        showDiffOnly={false}
                        styles={{
                            variables: {
                                light: {
                                    diffViewerBackground: "var(--body-background)",
                                    addedBackground: "var(--identity-added)",
                                    removedBackground: "var(--identity-removed)",
                                    addedColor: "var(--body-color)",
                                    removedColor: "var(--body-color)"
                                }
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    private readonly highlightSyntax = (str: string): JSX.Element => (
        <span
            className="json-viewer"
            dangerouslySetInnerHTML={{
                __html: JsonSyntaxHelper.syntaxHighlight(str)
            }}
        />
    );
}

export default IdentityJsonCompare;
