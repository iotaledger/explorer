import "./IdentityTreeItem.scss";
import classNames from "classnames";
import moment from "moment";
import React, { Component, Fragment, ReactNode } from "react";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { DiffMessage } from "../../../../models/api/IIdentityDiffHistoryResponse";
import { IIdentityMessageWrapper } from "../../../../models/identity/IIdentityMessageWrapper";
import { IdentityDiffStorageService } from "../../../../services/identityDiffStorageService";
import { IdentityService } from "../../../../services/identityService";
import IdentityMsgStatusIcon from "../IdentityMsgStatusIcon";
import { IdentityTreeItemProps } from "./IdentityTreeItemProps";
import { IdentityTreeItemState } from "./IdentityTreeItemState";

const BACKWARDS_CURVED_LINE = (
    <div className="backward-curved-line fade-animation">
        <svg width="24" height="60" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 0C1 27.0423 23 32.9577 23 60" stroke="#EEEEEE" strokeWidth="2" />
        </svg>
    </div>
);

const FORWARD_CURVED_LINE = (
    <div className="forward-curved-line fade-animation">
        <svg width="24" height="60" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 60C1 32.9577 23 27.0423 23 5.96046e-08" stroke="#EEEEEE" strokeWidth="2" />
        </svg>
    </div>
);

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
            <div className="identity-item-wrapper">
                {this.props.nested && (
                    <Fragment>
                        {!this.props.parentFirstMsg && this.props.firstMsg && <div>{BACKWARDS_CURVED_LINE}</div>}
                        {this.props.lastMsg && <div>{FORWARD_CURVED_LINE}</div>}
                    </Fragment>
                )}

                {/* --------- Nested Element/s --------- */}
                {this.state.hasChildren && (
                    <Fragment>
                        {(this.state.diffHistory?.chainData?.length === 0 ||
                            this.state.loadingChildren ||
                            this.state.error) && (
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

                                            <div className="no-diff-icon" />
                                            {this.state.diffHistory?.chainData?.length === 0 && (
                                                <p className="title no-diff-title"> No diffs found</p>
                                            )}
                                            {this.state.error && <p className="title no-diff-title"> Error</p>}
                                        </div>
                                    )}
                                {!this.props.firstMsg && <div>{BACKWARDS_CURVED_LINE}</div>}
                                <div>{FORWARD_CURVED_LINE}</div>
                            </div>
                        )}
                        {/* --------- Diff children if Parent is Integration message  --------- */}
                        {!this.state.loadingChildren &&
                            this.state.diffHistory?.chainData?.map((value, index) => (
                                <div key={index} className="expand-animation">
                                    <IdentityTreeItem
                                        network={this.props.network}
                                        version={this.props.version}
                                        lastMsg={index === (this.state.diffHistory?.chainData?.length ?? 0) - 1}
                                        nested={true}
                                        firstMsg={index === 0}
                                        selectedMessage={this.props.selectedMessage}
                                        itemMessage={{
                                            document: value.document,
                                            message: value.message,
                                            messageId: value.messageId,
                                            isDiff: true,
                                            parentMessageId: this.props.itemMessage.messageId
                                        }}
                                        parentFirstMsg={this.props.firstMsg}
                                        onItemClick={content => {
                                            this.props.onItemClick(
                                                content,
                                                this.getPreviousMessages(content.messageId)
                                            );
                                        }}
                                        onDiffMessagesUpdate={this.props.onDiffMessagesUpdate}
                                    />
                                </div>
                            ))}
                    </Fragment>
                )}

                {/* --------- Item Content --------- */}
                <div
                    className={classNames("tree-item-container noselect ", {
                        "tree-item-selected": this.props.selectedMessage.messageId === this.props.itemMessage.messageId
                    })}
                    onClick={() => {
                        if (this.props.selectedMessage.messageId === this.props.itemMessage.messageId) {
                            this.setState({
                                hasChildren: false
                            });
                            return;
                        }
                        this.props.onItemClick(this.props.itemMessage);
                    }}
                >
                    {!this.props.nested && !this.props.firstMsg && <div className="upper-left-straight-line" />}
                    {!this.props.nested && !this.props.lastMsg && <div className="lower-left-straight-line" />}
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
                        </Fragment>
                    )}
                    {!this.props.nested && (
                        <div className="msg-icon-left">
                            <IdentityMsgStatusIcon status="integration" />
                        </div>
                    )}
                    {this.props.nested && (
                        <div className="msg-icon-right fade-animation">
                            <IdentityMsgStatusIcon status="diff" />
                        </div>
                    )}
                    <div
                        className={classNames("content", {
                            "push-right": this.props.nested
                        })}
                    >
                        {/* --------- Title and timestamp --------- */}
                        <div>
                            <p className="title">{this.shortenMsgId(this.props.itemMessage.messageId ?? "")}</p>
                            {this.props.itemMessage.document?.meta?.updated ? (
                                <p className="time-stamp">
                                    {moment(this.props.itemMessage.document.meta.updated).format("MMM D  hh:mm:ss a")}
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

    /**
     * -
     * @param messageId messageId of Diff Message.
     * @returns array of previous Diff messages.
     */
    private getPreviousMessages(messageId: string): IIdentityMessageWrapper[] {
        const diffChainData = this.state.diffHistory?.chainData;
        if (!diffChainData) {
            return [];
        }

        const index = diffChainData.findIndex((element: { messageId: string }) => element.messageId === messageId);

        const previousMessages = [];
        for (let i = index + 1; i < diffChainData.length; i++) {
            previousMessages.push({
                messageId: diffChainData[i].messageId,
                message: diffChainData[i].document,
                document: diffChainData[i].document,
                isDiff: true
            });
        }
        return previousMessages;
    }

    private shortenMsgId(msgId: string): string {
        if (msgId.length < 10) {
            return msgId;
        }

        return `${msgId.slice(0, 7)}....${msgId.slice(-7)}`;
    }

    /**
     * Requests the Diff history of the current integration message
     * It should only be called if the current item is not nested (Integration message)
     * @returns void
     */
    private async loadDiffHistory() {
        this.setState({
            loadingChildren: true
        });

        if (!this.props.itemMessage.messageId || !this.props.network) {
            return;
        }
        const res = await ServiceFactory.get<IdentityService>("identity").resolveDiffHistory(
            this.props.itemMessage.messageId,
            this.props.network,
            this.props.version,
            this.props.itemMessage.message
        );

        // if result includes Error
        if (res.error) {
            this.setState({
                error: res.error,
                loadingChildren: false,
                diffHistory: undefined
            });
            console.error(res.error);
            return;
        }

        // reverse the order (first message becomes the newest)
        res.chainData = res.chainData?.reverse();

        // convert diff from string to object so it can be highlighted in json viewer
        for (let i = 0; i < res.chainData.length; i++) {
            const diff = res.chainData[i];
            if (typeof (diff.message as DiffMessage).diff === "string") {
                (res.chainData[i].message as DiffMessage).diff = JSON.parse(
                    this.removeEscapingBackslash((diff?.message as DiffMessage).diff as string) ?? ""
                );
                res.chainData[i].isDiff = true;
            }
        }

        this.setState({
            loadingChildren: false,
            diffHistory: res,
            error: undefined
        });

        IdentityDiffStorageService.instance.setDiffMessages(this.props.itemMessage.messageId, res.chainData);

        // in case a newer message is selected, the loaded diffs will be available to compare with.
        this.props.onDiffMessagesUpdate();
    }

    private removeEscapingBackslash(str: string) {
        // eslint-disable-next-line @typescript-eslint/quotes
        return str.replace(/"{/g, '{')
            .replace(/}"/g, "}")
            .replace(/"\[/g, "[")
            .replace(/]"/g, "]")
            .replace(/"\\"/g, "\"")
            .replace(/\\""/g, "\"")
            .replace(/\\"/g, "\"");
    }
}
