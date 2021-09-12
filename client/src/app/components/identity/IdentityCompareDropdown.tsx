import "./IdentityCompareDropdown.scss";

import React, { Component, Fragment, ReactNode } from "react";

import { AiOutlineCloseCircle } from "react-icons/ai";
import { IconContext } from "react-icons/lib";
import { IdentityCompareDropdownProps } from "./IdentityCompareDropdownProps";
import { IdentityCompareDropdownState } from "./IdentityCompareDropdownstate";
import { IdentityHelper } from "../../../helpers/IdentityHelper";
import IdentityMsgStatusIcon from "./IdentityMsgStatusIcon";
import { IoWarningOutline } from "react-icons/io5";
import chevronDownGray from "../../../assets/chevron-down-gray.svg";

class IdentityCompareDropdown extends Component<IdentityCompareDropdownProps, IdentityCompareDropdownState> {
    constructor(props: IdentityCompareDropdownProps) {
        super(props);

        this.state = {
            selectedMessageId: "",
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
            <Fragment>
                <div className="dropdown-wrapper noselect">
                    <div
                        className="compare-selector row middle"
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
                        {!this.state.selectedMessageId ? (
                            <p className="dropdown-placeholder">compare with</p>
                        ) : (
                            <Fragment>
                                <IdentityMsgStatusIcon status="integration" />

                                <p className="margin-l-t">
                                    {IdentityHelper.shortenMsgId(this.state.selectedMessageId)}
                                </p>
                            </Fragment>
                        )}

                        <p> </p>
                        <img src={chevronDownGray} alt="expand" />
                    </div>
                    {this.state.contentShown && (
                        <div className="dropdown-content">
                            {this.props.messages.map((value, index) => (
                                <div
                                    className="dropdown-item"
                                    key={index}
                                    onMouseUp={e => {
                                        e.stopPropagation();
                                    }}
                                    onClick={e => {
                                        this.setState({
                                            selectedMessageId: value.messageId,
                                            contentShown: !this.state.contentShown
                                        });
                                        this.props.onSelectionChange(value.messageId, value.content);
                                    }}
                                >
                                    <div className="dropdown-item-title row middle">
                                        <IdentityMsgStatusIcon status="integration" />
                                        <p> {IdentityHelper.shortenMsgId(value.messageId)}</p>
                                    </div>
                                    <p className="dropdown-item-timestamp"> n/a </p>
                                </div>
                            ))}

                            {this.props.messages.length === 0 && (
                                <div className="dropdoen-item row middle">
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
                {this.state.selectedMessageId && (
                    <button
                        className="reset-button"
                        type="button"
                        onClick={e => {
                            this.setState({
                                selectedMessageId: undefined
                            });
                            this.props.onSelectionChange();
                        }}
                    >
                        <IconContext.Provider value={{ color: "#8493ad", size: "20px" }}>
                            <AiOutlineCloseCircle />
                        </IconContext.Provider>
                    </button>
                )}
            </Fragment>
        );
    }

    // private toggleContent() {
    //     this.setState({
    //         contentShown: !this.state.contentShown
    //     });
    //     return undefined;
    // }
}
export default IdentityCompareDropdown;
