import "./IdentityJsonCompare.scss";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import ReactDiffViewer from "react-diff-viewer";
import { HiDownload } from "react-icons/hi";
import { DownloadHelper } from "../../../helpers/downloadHelper";
import { JsonSyntaxHelper } from "../../../helpers/jsonSyntaxHelper";
import IdentityCompareDropdown from "./IdentityCompareDropdown";
import { IdentityJsonCompareProps } from "./IdentityJsonCompareProps";
import { IdentityJsonCompareState } from "./IdentityJsonCompareState";
import IdentityMessageIdOverview from "./IdentityMsgIdOverview";

const COMPARE_ICON = (
    <svg
        className="compare-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="5" y="5" width="10" height="10" rx="2" stroke="#BDBDBD" strokeWidth="2" />
        <rect x="9" y="9" width="10" height="10" rx="2" stroke="#BDBDBD" strokeWidth="2" />
        <path
            // eslint-disable-next-line max-len
            d="M15.9999 8V13.9999C15.9999 15.1044 15.1044 15.9999 13.9999 15.9999H8V10C8 8.89543 8.89543 8 10 8H15.9999Z"
            fill="#BDBDBD"
        />
    </svg>
);

class IdentityJsonCompare extends Component<IdentityJsonCompareProps, IdentityJsonCompareState> {
    constructor(props: IdentityJsonCompareProps) {
        super(props);

        this.state = {
            toggleState: "doc"
        };
    }

    public render(): ReactNode {
        return (
            <div className="container">
                {/* --------- Header of JsonViewer --------- */}
                <div className="identity-json-header">
                    <div className="compare-elements">
                        <IdentityMessageIdOverview
                            status={this.props.selectedMessage?.isDiff ? "diff" : "integration"}
                            messageId={this.props.selectedMessage?.messageId}
                            onClick={() => {
                                // eslint-disable-next-line max-len
                                window.location.href = `/${this.props.network}/message/${this.props.selectedMessage?.messageId}`;
                            }}
                        />
                        {!(this.props.selectedMessage?.isDiff && this.state.toggleState === "msg") && (
                            <div>
                                <div className="row">
                                    {COMPARE_ICON}
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
                            <HiDownload size={20} />
                        </a>
                    </div>
                </div>

                {/* --------- Json Compare Viewer --------- */}
                <div
                    className="
                    card--value
                    card--value-textarea
                    card--value-textarea__json"
                >
                    <ReactDiffViewer
                        newValue={JSON.stringify(
                            this.state.toggleState === "doc"
                                ? this.props.selectedMessage?.document
                                : this.props.selectedMessage?.message,
                            null,
                            4
                        )}
                        oldValue={
                            this.props.selectedComparisonMessage?.message &&
                            this.props.selectedComparisonMessage.document
                                ? JSON.stringify(
                                      this.state.toggleState === "doc"
                                          ? this.props.selectedComparisonMessage.document
                                          : this.props.selectedComparisonMessage.message,
                                      null,
                                      4
                                  )
                                : JSON.stringify(
                                      this.state.toggleState === "doc"
                                          ? this.props.selectedMessage?.document
                                          : this.props.selectedMessage?.message,
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
                                    diffViewerBackground: "#f2f5fb"
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
