import React, { Component, ReactNode } from "react";
import { IdentityMsgIdOverviewProps } from "./IdentityMsgIdOverviewProps";
import IdentityMsgStatusIcon from "./IdentityMsgStatusIcon";
import "./IdentityMsgIdOverview.scss";

export default class IdentityMessageIdOverview extends Component<IdentityMsgIdOverviewProps> {
    private readonly EMPTY_MESSAGE_ID = "0".repeat(64);

    public render(): ReactNode {
        return (
            <div>
                {this.props.messageId !== undefined &&
                    this.props.messageId !== this.EMPTY_MESSAGE_ID && (
                        <div
                            className="msg-id-overview pointer"
                            onClick={() => {
                                this.props.onClick();
                            }}
                        >
                            <IdentityMsgStatusIcon status="integration" />
                            <p>{this.shortenMsgId(this.props.messageId ?? "")}</p>
                        </div>
                    )}

                {this.props.messageId === this.EMPTY_MESSAGE_ID && (
                    <div
                        className="msg-id-overview"
                    >
                        <IdentityMsgStatusIcon status="unavailable" />
                        <p>Multiple Messages</p>
                    </div>
                )}
            </div>
        );
    }

    private shortenMsgId(msgId: string): string {
        if (msgId.length < 10) {
            return msgId;
        }

        return `${msgId.slice(0, 7)}....${msgId.slice(-7)}`;
    }
}
