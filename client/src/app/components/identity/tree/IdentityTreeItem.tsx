import "./IdentityTreeItem.scss";

import React, { Component, Fragment, ReactNode } from "react";

import IdentityMsgStatusIcon from "../IdentityMsgStatusIcon";
import { IdentityService } from "../../../../services/identityService";
import { IdentityTreeItemProps } from "./IdentityTreeItemProps";
import { IdentityTreeItemState } from "./IdentityTreeItemState";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import classNames from "classnames";
import moment from "moment";

export default class IdentityTreeItem extends Component<IdentityTreeItemProps, IdentityTreeItemState> {
    constructor(props: IdentityTreeItemProps) {
        super(props);

        this.state = {
            hasChildren: false,
            loadingChildren: false,
            diffHistory: undefined,
            error: undefined
        };
    }

    public render(): ReactNode {
        return (
            <div>
                {/* --------- Nested Element/s --------- */}
                {this.state.hasChildren && (
                    <Fragment>
                        {((this.state.hasChildren && this.state.diffHistory?.chainData?.length === 0) ||
                            this.state.loadingChildren) && (
                            <div className="expand-animation">
                                {/* --------- Loading Diff Chain... --------- */}
                                {this.state.loadingChildren && (
                                    <div className="tree-item-container">
                                        {!this.props.firstMsg && (
                                            <Fragment>
                                                <div className="lower-left-straight-line" />
                                                <div className="upper-left-straight-line" />
                                            </Fragment>
                                        )}
                                        <div className="forward-curved-line-lower">
                                            <svg
                                                width="17"
                                                height="47"
                                                viewBox="0 0 17 47"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M16 0C16 20.5699 7.73592 33.3097 1.83221 46.5"
                                                    stroke="#EEEEEE"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        </div>
                                        <div className="loading-diff-icon" />
                                        <p className="title loading-diff-title"> Loading Diff Chain</p>
                                    </div>
                                )}

                                {/* --------- ⚠ Error or No Diffs Found --------- */}
                                {!this.state.loadingChildren &&
                                    (this.state.diffHistory?.chainData?.length === 0 || this.state.error) && (
                                        <div className="tree-item-container">
                                            {!this.props.firstMsg && (
                                                <Fragment>
                                                    <div className="lower-left-straight-line" />
                                                    <div className="upper-left-straight-line" />
                                                </Fragment>
                                            )}

                                            <div className="forward-curved-line-lower">
                                                <svg
                                                    width="17"
                                                    height="47"
                                                    viewBox="0 0 17 47"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M16 0C16 20.5699 7.73592 33.3097 1.83221 46.5"
                                                        stroke="#EEEEEE"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            </div>
                                            {/* 
                                    <div className="backward-curved-line-upper">
                                        <svg
                                            width="22"
                                            height="72"
                                            viewBox="0 0 22 72"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 0C1 32 21 32 21 64M21 64C21 84.8889 21 54.9259 21 64Z"
                                                stroke="#EEEEEE"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    </div> */}
                                            <div className="no-diff-icon" />
                                            {this.state.diffHistory?.chainData?.length === 0 && (
                                                <p className="title no-diff-title"> No diffs found</p>
                                            )}
                                            {this.state.error && <p className="title no-diff-title"> Error</p>}
                                        </div>
                                    )}
                            </div>
                        )}
                        {/* --------- Diff children if Parent is Integration message  --------- */}
                        {!this.state.loadingChildren &&
                            this.state.diffHistory?.chainData?.map((value, index) => (
                                <div key={index} className="expand-animation">
                                    <IdentityTreeItem
                                        network={this.props.network}
                                        lastMsg={index === (this.state.diffHistory?.chainData?.length ?? 0) - 1}
                                        nested={true}
                                        firstMsg={index === 0}
                                        selectedMessageId={this.props.selectedMessageId}
                                        messageId={value?.messageId}
                                        content={value?.message}
                                        parentFirstMsg={this.props.firstMsg}
                                        onItemClick={(messageId, content) => {
                                            this.props.onItemClick(messageId, content);
                                        }}
                                    />
                                </div>
                            ))}
                    </Fragment>
                )}

                {/* --------- Item Content --------- */}
                <div
                    className={classNames("tree-item-container noselect ", {
                        "tree-item-selected": this.props.selectedMessageId === this.props.messageId
                    })}
                    onClick={() => {
                        this.props.onItemClick(this.props.messageId, this.props.content);
                    }}
                >
                    {!this.props.nested && !this.props.firstMsg && <div className="upper-left-straight-line" />}
                    {!this.props.nested && !this.props.lastMsg && <div className="lower-left-straight-line" />}
                    {!this.props.nested && this.state.hasChildren && (
                        <div className="forward-curved-line-upper">
                            {/* <svg
                                width="22"
                                height="72"
                                viewBox="0 0 22 72"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1 0C1 32 21 32 21 64M21 64C21 84.8889 21 54.9259 21 64Z"
                                    stroke="#EEEEEE"
                                    strokeWidth="2"
                                />
                            </svg> */}
                            {/* becomes upper curved */}
                            <svg
                                width="13"
                                height="38"
                                viewBox="0 0 13 38"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M11.8322 0.5C6.58975 10.767 1.06409 20.6799 1.06409 37.5"
                                    stroke="#EEEEEE"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                    )}

                    {this.props.nested && (
                        <Fragment>
                            {!this.props.parentFirstMsg && (
                                <Fragment>
                                    <div className="upper-left-straight-line" />
                                    <div className="lower-left-straight-line" />
                                </Fragment>
                            )}

                            {!this.props.firstMsg && <div className="upper-right-straight-line" />}
                            {!this.props.lastMsg && <div className="lower-right-straight-line" />}
                            {this.props.lastMsg && (
                                <div className="forward-curved-line-lower">
                                    {/* <svg
                                        width="22"
                                        height="72"
                                        viewBox="0 0 22 72"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M1 0C1 32 21 32 21 64M21 64C21 84.8889 21 54.9259 21 64Z"
                                            stroke="#EEEEEE"
                                            strokeWidth="2"
                                        />
                                    </svg> */}

                                    {/* becomes lower curved */}
                                    <svg
                                        width="17"
                                        height="47"
                                        viewBox="0 0 17 47"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M16 0C16 20.5699 7.73592 33.3097 1.83221 46.5"
                                            stroke="#EEEEEE"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </div>
                            )}
                        </Fragment>
                    )}
                    {!this.props.nested && (
                        <div className="msg-icon-left">
                            <IdentityMsgStatusIcon status="integration" />
                        </div>
                    )}
                    {this.props.nested && (
                        <div className="msg-icon-right">
                            <IdentityMsgStatusIcon status="diff" />
                        </div>
                    )}
                    <div
                        className={classNames("content row", {
                            "push-right": this.props.nested
                        })}
                    >
                        {/* --------- Title and timestamp --------- */}
                        <div>
                            <p className="title">{this.shortenMsgId(this.props.messageId ?? "")}</p>
                            {this.props.content?.created ? (
                                <p className="time-stamp">
                                    {moment(this.props.content?.updated).format("MMM D  hh:mm:ss a")}
                                </p>
                            ) : (
                                <p className="time-stamp"> n.a.</p>
                            )}
                        </div>

                        {/* --------- Diff button --------- */}
                        {!this.props.nested && !this.state.hasChildren && (
                            <a
                                className={classNames("diff-icon", { "diff-icon-active": this.state.hasChildren })}
                                onClick={async event => {
                                    event.stopPropagation();
                                    await this.handleDiffButtonOnClick();
                                }}
                            >
                                <svg
                                    width="17"
                                    height="19"
                                    viewBox="0 0 17 19"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        // eslint-disable-next-line max-len
                                        d="M4.00101 10.9995V12.1725C4.6685 12.4084 5.2311 12.8727 5.58937 13.4833C5.94763 14.0939 6.07849 14.8115 5.95882 15.5093C5.83914 16.207 5.47664 16.84 4.93538 17.2964C4.39412 17.7527 3.70896 18.003 3.00101 18.003C2.29305 18.003 1.60789 17.7527 1.06663 17.2964C0.525375 16.84 0.16287 16.207 0.043195 15.5093C-0.0764802 14.8115 0.0543805 14.0939 0.412646 13.4833C0.770912 12.8727 1.33351 12.4084 2.00101 12.1725V5.83049C1.33351 5.59458 0.770912 5.13029 0.412646 4.51968C0.0543805 3.90907 -0.0764802 3.19146 0.043195 2.4937C0.16287 1.79593 0.525375 1.16294 1.06663 0.706614C1.60789 0.250285 2.29305 0 3.00101 0C3.70896 0 4.39412 0.250285 4.93538 0.706614C5.47664 1.16294 5.83914 1.79593 5.95882 2.4937C6.07849 3.19146 5.94763 3.90907 5.58937 4.51968C5.2311 5.13029 4.6685 5.59458 4.00101 5.83049V8.17049C4.31301 8.06049 4.64801 8.00049 4.99801 7.99949L11.035 7.99349C11.3 7.99322 11.5541 7.88775 11.7415 7.70024C11.9288 7.51273 12.034 7.25853 12.034 6.99349V5.84249C11.3617 5.61291 10.7926 5.15223 10.428 4.54243C10.0634 3.93263 9.927 3.21326 10.043 2.51233C10.1591 1.8114 10.52 1.17437 11.0617 0.7146C11.6033 0.254829 12.2905 0.0021362 13.001 0.00148773C13.7059 0.00119419 14.3884 0.249123 14.9287 0.701779C15.4691 1.15444 15.8328 1.78291 15.956 2.47695C16.0793 3.17098 15.9542 3.88625 15.6028 4.49728C15.2513 5.10831 14.6959 5.57606 14.034 5.81849V6.99349C14.034 7.78862 13.7183 8.55123 13.1564 9.11375C12.5944 9.67627 11.8321 9.99269 11.037 9.99349L5.00001 9.99949C4.73496 9.99975 4.48087 10.1052 4.29355 10.2927C4.10623 10.4802 4.00101 10.7344 4.00101 10.9995Z"
                                        fill="#BDBDBD"
                                    />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Handles mouse click of Diff icon.
     * It hides/shows history if already loaded. Otherwise it loads history and shows it.
     * @returns void
     */
    private async handleDiffButtonOnClick() {
        if (this.state.hasChildren) {
            this.setState({
                hasChildren: false
            });
            return;
        }
        this.setState({
            hasChildren: true
        });
        if (!this.state.diffHistory) {
            await this.loadDiffHistory();
        }
    }

    private shortenMsgId(msgId: string): string {
        if (msgId.length < 10) {
            return msgId;
        }

        return `${msgId.slice(0, 7)}....${msgId.slice(-7)}`;
    }

    /**
     * Requests the Diff history of the current integration message
     * It should only be called if the currrent item is not nested (Integration message)
     * @returns void
     */
    private async loadDiffHistory() {
        this.setState({
            loadingChildren: true
        });

        if (!this.props.messageId || !this.props.network) {
            return;
        }
        const res = await ServiceFactory.get<IdentityService>("identity").resolveDiffHistory(
            this.props.messageId,
            this.props.network,
            this.props.content
        );

        // if result includes Error
        if (res.error) {
            this.setState({
                error: res.error,
                loadingChildren: false
            });
            console.error(res.error);
            return;
        }

        // reverse the order (first message becomes the newest)
        res.chainData = res.chainData?.reverse();

        // convert diff from string to object so it can be higlighted in json viewer
        for (let i = 0; i < res.chainData.length; i++) {
            const diff = res.chainData[i];
            if (typeof diff.message.diff === "string") {
                res.chainData[i].message.diff = JSON.parse(this.removeEscapingBackslash(diff?.message.diff) ?? "");
            }
        }

        this.setState({
            loadingChildren: false,
            diffHistory: res
        });
    }

    private removeEscapingBackslash(str: string) {
        // eslint-disable-next-line @typescript-eslint/quotes
        return str.replace(/\\"/g, '"');
    }
}
