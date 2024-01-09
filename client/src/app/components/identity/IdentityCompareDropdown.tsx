import classNames from "classnames";
import moment from "moment";
import React, { Component, ReactNode } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { IconContext } from "react-icons/lib";
import "./IdentityCompareDropdown.scss";
import { IdentityCompareDropdownProps } from "./IdentityCompareDropdownProps";
import { IdentityCompareDropdownState } from "./IdentityCompareDropdownState";
import IdentityMsgStatusIcon from "./IdentityMsgStatusIcon";
import { IdentityHelper } from "~helpers/identityHelper";

class IdentityCompareDropdown extends Component<IdentityCompareDropdownProps, IdentityCompareDropdownState> {
    constructor(props: IdentityCompareDropdownProps) {
        super(props);

        this.state = {
            contentShown: false,
        };

        window.addEventListener("mouseup", (e) => {
            if (this.state.contentShown) {
                e.stopPropagation();
                this.setState({
                    contentShown: false,
                });
            }
        });
    }

    public render(): ReactNode {
        return (
            <div
                className="identity-compare-dropdown row middle"
                onMouseUp={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="dropdown-wrapper noselect">
                    {/* ---------  selector --------- */}
                    <div
                        className={classNames("compare-selector", { opened: this.state.contentShown })}
                        onMouseUp={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            this.setState({
                                contentShown: !this.state.contentShown,
                            });
                        }}
                    >
                        {this.props.selectedMessage?.messageId ? (
                            <div className="row middle message-selected">
                                <IdentityMsgStatusIcon status={this.props.selectedMessage.isDiff ? "diff" : "integration"} />

                                <p className="margin-l-s margin-r-2">{IdentityHelper.shortenMsgId(this.props.selectedMessage.messageId)}</p>
                                {/* --------- Reset Button --------- */}
                                {this.props.selectedMessage && (
                                    <button
                                        className="reset-button"
                                        type="button"
                                        onClick={(e) => {
                                            this.props.onSelectionChange();
                                        }}
                                    >
                                        <span className="material-icons close">close</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="dropdown-placeholder">Compare with</p>
                        )}

                        <span className="material-icons dropdown">arrow_drop_down</span>
                    </div>

                    {/* --------- dropdown content --------- */}
                    {this.state.contentShown && (
                        <div className="dropdown-content">
                            {this.props.messages.map((value, index) => (
                                <div
                                    className={classNames("dropdown-item", {
                                        "dropdown-item-selected": this.props.selectedMessage?.messageId === value.messageId,
                                    })}
                                    key={index}
                                    onMouseUp={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        this.setState({
                                            contentShown: !this.state.contentShown,
                                        });
                                        this.props.onSelectionChange(value);
                                    }}
                                >
                                    {/* --------- title --------- */}
                                    <div className="dropdown-item-title row middle">
                                        <IdentityMsgStatusIcon status={value.isDiff ? "diff" : "integration"} />
                                        <p> {IdentityHelper.shortenMsgId(value.messageId)}</p>
                                    </div>
                                    {/* --------- timestamp --------- */}
                                    <p className="dropdown-item-timestamp">
                                        {moment(value.document?.meta.updated).format("MMM D  hh:mm:ss a")}
                                    </p>
                                </div>
                            ))}
                            {/* --------- ⚠ warning if no messages to select --------- */}
                            {this.props.messages.length === 0 && (
                                <div className="row middle">
                                    <div className="margin-l-s">
                                        <IconContext.Provider value={{ color: "#ffc107", size: "20px" }}>
                                            <IoWarningOutline />
                                        </IconContext.Provider>
                                    </div>
                                    <p className="dropdown-item-warning"> no previous messages</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
export default IdentityCompareDropdown;
