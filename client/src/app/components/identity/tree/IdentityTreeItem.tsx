import classNames from "classnames";
import React, { Component, Fragment, ReactNode } from "react";
import IdentityMsgStatusIcon from "../IdentityMsgStatusIcon";
import { IdentityTreeItemProps } from "./IdentityTreeItemProps";
import "./IdentityTreeItem.scss";
import { IdentityTreeItemState } from "./IdentityTreeItemState";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IdentityService } from "../../../../services/identityService";

export default class IdentityTreeItem extends Component<IdentityTreeItemProps, IdentityTreeItemState> {
    constructor(props: IdentityTreeItemProps) {
        super(props);

        this.state = {
            hasChildren: Boolean(props.hasChildren),
            loadingChildren: false,
            isSelected: false,
            diffHistory: undefined
        };
    }

    public render(): ReactNode {
        return (
            <div>
                <div
                    className={classNames("tree-item-container fadeIn", {
                        "tree-item-selected": this.props.selected
                    })}
                    onClick={() => {
                        this.props.onClick();
                    }}
                >
                    {!this.props.nested && !this.props.firstMsg && <div className="upper-left-straight-line" />}
                    {!this.props.nested && !this.props.lastMsg && <div className="lower-left-straight-line" />}

                    {!this.props.nested && this.state.hasChildren && (
                        <div className="lower-curved-line">
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
                        </div>
                    )}

                    {this.props.nested && (
                        <Fragment>
                            <div className="lower-left-straight-line" />
                            <div className="upper-left-straight-line" />
                            {!this.props.firstMsg && <div className="upper-right-straight-line" />}
                            {!this.props.lastMsg && <div className="lower-right-straight-line" />}
                            {this.props.firstMsg && (
                                <div className="upper-curved-line">
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
                        <div>
                            <p className="title">{this.shortenMsgId(this.props.messageId ?? "")}</p>

                            <p className="time-stamp">Jul 26 01:38 AM</p>
                        </div>

                        {!this.props.nested && (
                            <a
                                className="diff-icon"
                                onClick={async event => {
                                    event.stopPropagation();
                                    if (this.state.hasChildren) {
                                        this.setState({
                                            hasChildren: false
                                        });
                                        return;
                                    }

                                    if (!this.state.diffHistory) {
                                        await this.loadHistory();
                                    }
                                    this.setState({
                                        hasChildren: true
                                    });
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
                                        d="M4.00101 8.00051V6.82751C4.6685 6.59161 5.2311 6.12732 5.58937 5.51671C5.94763 4.9061 6.07849 4.18849 5.95882 3.49072C5.83914 2.79296 5.47664 2.15997 4.93538 1.70364C4.39412 1.24731 3.70896 0.997025 3.00101 0.997025C2.29305 0.997025 1.60789 1.24731 1.06663 1.70364C0.525375 2.15997 0.16287 2.79296 0.043195 3.49072C-0.0764802 4.18849 0.0543805 4.9061 0.412646 5.51671C0.770912 6.12732 1.33351 6.59161 2.00101 6.82751V13.1695C1.33351 13.4054 0.770912 13.8697 0.412646 14.4803C0.0543805 15.0909 -0.0764802 15.8085 0.043195 16.5063C0.16287 17.2041 0.525375 17.8371 1.06663 18.2934C1.60789 18.7497 2.29305 19 3.00101 19C3.70896 19 4.39412 18.7497 4.93538 18.2934C5.47664 17.8371 5.83914 17.2041 5.95882 16.5063C6.07849 15.8085 5.94763 15.0909 5.58937 14.4803C5.2311 13.8697 4.6685 13.4054 4.00101 13.1695V10.8295C4.31301 10.9395 4.64801 10.9995 4.99801 11.0005L11.035 11.0065C11.3 11.0068 11.5541 11.1123 11.7415 11.2998C11.9288 11.4873 12.034 11.7415 12.034 12.0065V13.1575C11.3617 13.3871 10.7926 13.8478 10.428 14.4576C10.0634 15.0674 9.927 15.7867 10.043 16.4877C10.1591 17.1886 10.52 17.8256 11.0617 18.2854C11.6033 18.7452 12.2905 18.9979 13.001 18.9985C13.7059 18.9988 14.3884 18.7509 14.9287 18.2982C15.4691 17.8456 15.8328 17.2171 15.956 16.5231C16.0793 15.829 15.9542 15.1137 15.6028 14.5027C15.2513 13.8917 14.6959 13.4239 14.034 13.1815V12.0065C14.034 11.2114 13.7183 10.4488 13.1564 9.88625C12.5944 9.32373 11.8321 9.00731 11.037 9.00651L5.00001 9.00051C4.73496 9.00025 4.48087 8.89477 4.29355 8.70727C4.10623 8.51976 4.00101 8.26556 4.00101 8.00051Z"
                                        fill="#BDBDBD"
                                    />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
                {this.state.hasChildren && (
                    <Fragment>
                        {this.state.loadingChildren && (
                            <div className="tree-item-container fadeIn">
                                {!this.props.lastMsg && (
                                    <Fragment>
                                        <div className="lower-left-straight-line" />
                                        <div className="upper-left-straight-line" />
                                    </Fragment>
                                )}
                                <div className="upper-curved-line">
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
                                </div>
                                <div className="loading-diff-icon" />
                                <p className="title loading-diff-title"> Loading Diff Chain</p>
                            </div>
                        )}

                        {!this.state.loadingChildren && (
                            <Fragment>
                                <IdentityTreeItem
                                    network={this.props.network}
                                    lastMsg={false}
                                    nested={true}
                                    firstMsg={true}
                                    hasChildren={false}
                                    selected={true}
                                    onClick={() => {}}
                                />
                                {/* <IdentityTreeItem lastMsg={false} nested={true} firstMsg={false} hasChildren={false} />
                                <IdentityTreeItem lastMsg={true} nested={true} firstMsg={false} hasChildren={false} /> */}
                            </Fragment>
                        )}
                    </Fragment>
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

    private async loadHistory() {
        this.setState({
            loadingChildren: true
        });

        if (!this.props.messageId || !this.props.network) {
            return;
        }
        const res = await ServiceFactory.get<IdentityService>("identity").resolveDiffHistory(
            this.props.messageId,
            this.props.network,
            this.props.messageContent
        );

        console.log(res);

        if (typeof res.error === "object") {
            res.error = JSON.stringify(res.error);
        }
        this.setState({
            loadingChildren: false
        });
    }
}
