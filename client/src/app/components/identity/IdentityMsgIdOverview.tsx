import React, { Component, Fragment, ReactNode } from "react";
import { IdentityMsgIdOverviewProps } from "./IdentityMsgIdOverviewProps";
import { IdentityMsgOverviewState } from "./IdentityMsgIdOverviewState";
import IdentityMsgStatusIcon from "./IdentityMsgStatusIcon";
import "./IdentityMsgIdOverview.scss";

/**
 * Shows a shortened Message Id and a Message Icon depending on type of message.
 */
export default class IdentityMessageIdOverview extends Component<IdentityMsgIdOverviewProps, IdentityMsgOverviewState> {
    private readonly EMPTY_MESSAGE_ID = "0".repeat(64);

    public render(): ReactNode {
        return (
            <Fragment>
                {this.props.messageId !== "" && (
                    <div>
                        {this.props.messageId !== undefined && this.props.messageId !== this.EMPTY_MESSAGE_ID && (
                            <div
                                className="msg-id-overview pointer"
                                onClick={() => {
                                    this.props.onClick();
                                }}
                            >
                                <IdentityMsgStatusIcon status={this.props.status} />
                                <p>{this.shortenMsgId(this.props.messageId ?? "")}</p>
                            </div>
                        )}

                        {this.props.messageId === this.EMPTY_MESSAGE_ID && (
                            <div className="msg-id-overview">
                                <IdentityMsgStatusIcon status="unavailable" />
                                <p>Multiple Messages</p>
                            </div>
                        )}
                    </div>
                )}
                <div />
            </Fragment>
        );
    }

    private shortenMsgId(msgId: string): string {
        if (msgId.length < 10) {
            return msgId;
        }

        return `${msgId.slice(0, 7)}....${msgId.slice(-7)}`;
    }
}
