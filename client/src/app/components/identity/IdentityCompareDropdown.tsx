import "./IdentityCompareDropdown.scss";
import classNames from "classnames";
import moment from "moment";
import React, { Component, ReactNode } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { IoWarningOutline } from "react-icons/io5";
import { IconContext } from "react-icons/lib";
import chevronDownGray from "../../../assets/chevron-down-gray.svg";
import { IdentityHelper } from "../../../helpers/identityHelper";
import { IdentityCompareDropdownProps } from "./IdentityCompareDropdownProps";
import { IdentityCompareDropdownState } from "./IdentityCompareDropdownState";
import IdentityMsgStatusIcon from "./IdentityMsgStatusIcon";

class IdentityCompareDropdown extends Component<IdentityCompareDropdownProps, IdentityCompareDropdownState> {
    constructor(props: IdentityCompareDropdownProps) {
        super(props);

        this.state = {
            contentShown: false
        };

        window.addEventListener("mouseup", e => {
            if (this.state.contentShown) {
                e.stopPropagation();
                this.setState({
                    contentShown: false
                });
            }
        });
    }

    public render(): ReactNode {
        return (
            <div
                className="row middle"
                onMouseUp={e => {
                    e.stopPropagation();
                }}
            >
                <div className="dropdown-wrapper noselect">
                    {/* ---------  selector --------- */}
                    <div
                        className="compare-selector"
                        onMouseUp={e => {
                            e.stopPropagation();
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            this.setState({
                                contentShown: !this.state.contentShown
                            });
                        }}
                    >
                        {!this.props.selectedMessage?.messageId ? (
                            <p className="dropdown-placeholder">compare with</p>
                        ) : (
                            <div className="row">
                                <IdentityMsgStatusIcon
                                    status={this.props.selectedMessage.isDiff ? "diff" : "integration"}
                                />

                                <p className="margin-l-t">
                                    {IdentityHelper.shortenMsgId(this.props.selectedMessage.messageId)}
                                </p>
                            </div>
                        )}

                        <img src={chevronDownGray} alt="expand" />
                    </div>

                    {/* --------- dropdown content --------- */}
                    {this.state.contentShown && (
                        <div className="dropdown-content">
                            {this.props.messages.map((value, index) => (
                                <div
                                    className={classNames("dropdown-item", {
                                        "dropdown-item-selected":
                                            this.props.selectedMessage?.messageId === value.messageId
                                    })}
                                    key={index}
                                    onMouseUp={e => {
                                        e.stopPropagation();
                                    }}
                                    onClick={e => {
                                        this.setState({
                                            contentShown: !this.state.contentShown
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
                                        {moment(value.document?.updated).format("MMM D  hh:mm:ss a")}
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
                {/* --------- Reset Button --------- */}
                {this.props.selectedMessage && (
                    <button
                        className="reset-button"
                        type="button"
                        onClick={e => {
                            this.props.onSelectionChange();
                        }}
                    >
                        <IconContext.Provider value={{ color: "#8493ad", size: "20px" }}>
                            <AiOutlineCloseCircle />
                        </IconContext.Provider>
                    </button>
                )}
            </div>
        );
    }
}
export default IdentityCompareDropdown;
