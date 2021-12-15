import classNames from "classnames";
import moment from "moment";
import React, { Component, Fragment, ReactNode } from "react";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IdentityHelper } from "../../../../helpers/identityHelper";
import { DiffMessage } from "../../../../models/api/IIdentityDiffHistoryResponse";
import { IIdentityMessageWrapper } from "../../../../models/identity/IIdentityMessageWrapper";
import { IdentityDiffStorageService } from "../../../../services/identityDiffStorageService";
import { IdentityService } from "../../../../services/identityService";
import IdentityMsgStatusIcon from "../IdentityMsgStatusIcon";
import "./IdentityTreeItem.scss";
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
                                        lastMsg={index === (this.state.diffHistory?.chainData?.length ?? 0) - 1}
                                        nested={true}
                                        firstMsg={index === 0}
                                        selectedMessage={this.props.selectedMessage}
                                        itemMessage={{
                                            document: IdentityHelper.removeMetaDataFromDocument(value.document),
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
                            {this.props.itemMessage.document.updated ? (
                                <p className="time-stamp">
                                    {moment(this.props.itemMessage.document.updated).format("MMM D  hh:mm:ss a")}
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
                                    height="20"
                                    viewBox="0 0 17 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        // eslint-disable-next-line max-len
                                        d="M4.99905 8.00198V6.82898C5.66655 6.59307 6.22915 6.12878 6.58741 5.51817C6.94568 4.90756 7.07654 4.18995 6.95686 3.49219C6.83719 2.79442 6.47468 2.16143 5.93342 1.7051C5.39217 1.24877 4.70701 0.998489 3.99905 0.998489C3.2911 0.998489 2.60594 1.24877 2.06468 1.7051C1.52342 2.16143 1.16092 2.79442 1.04124 3.49219C0.921567 4.18995 1.05243 4.90756 1.41069 5.51817C1.76896 6.12878 2.33156 6.59307 2.99905 6.82898V13.171C2.33156 13.4069 1.76896 13.8712 1.41069 14.4818C1.05243 15.0924 0.921567 15.81 1.04124 16.5078C1.16092 17.2055 1.52342 17.8385 2.06468 18.2949C2.60594 18.7512 3.2911 19.0015 3.99905 19.0015C4.70701 19.0015 5.39217 18.7512 5.93342 18.2949C6.47468 17.8385 6.83719 17.2055 6.95686 16.5078C7.07654 15.81 6.94568 15.0924 6.58741 14.4818C6.22915 13.8712 5.66655 13.4069 4.99905 13.171V10.831C5.31105 10.941 5.64605 11.001 5.99605 11.002L12.0331 11.008C12.2981 11.0082 12.5522 11.1137 12.7395 11.3012C12.9268 11.4887 13.0321 11.7429 13.0321 12.008V13.159C12.3597 13.3886 11.7906 13.8492 11.426 14.459C11.0615 15.0688 10.925 15.7882 11.0411 16.4891C11.1571 17.1901 11.5181 17.8271 12.0597 18.2869C12.6014 18.7466 13.2886 18.9993 13.9991 19C14.7039 19.0003 15.3864 18.7523 15.9268 18.2997C16.4671 17.847 16.8308 17.2186 16.9541 16.5245C17.0773 15.8305 16.9523 15.1152 16.6008 14.5042C16.2493 13.8932 15.6939 13.4254 15.0321 13.183V12.008C15.0321 11.2128 14.7164 10.4502 14.1544 9.88772C13.5925 9.32519 12.8302 9.00877 12.0351 9.00798L5.99805 9.00198C5.73301 9.00171 5.47891 8.89624 5.29159 8.70873C5.10427 8.52122 4.99905 8.26702 4.99905 8.00198Z"
                                        fill="#677695"
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
                document: IdentityHelper.removeMetaDataFromDocument(diffChainData[i].document),
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
                res.chainData[i].document = IdentityHelper.removeMetaDataFromDocument(res.chainData[i].document);
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
        return str.replace(/\\"/g, '"');
    }
}
