import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import "./HeaderExpanded.scss";
import { HeaderExpandedProps } from "./HeaderExpandedProps";
import { HeaderExpandedState } from "./HeaderExpandedState";


/**
 * Component which will display a transaction.
 */
class HeaderExpanded extends Component<HeaderExpandedProps, HeaderExpandedState> {
    /**
     * Create a new instance of HeaderExpanded.
     * @param props The props.
     */
    constructor(props: HeaderExpandedProps) {
        super(props);
        this.state = {
            isExpanded: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                className={
                    classNames(
                        `${this.props.className ? this.props.className : ""} header--expanded margin-l-s margin-r-m`,
                        { opened: this.state.isExpanded })
                }
            >
                <div
                    className={
                        classNames(
                            `header--expanded__dropdown row middle ${this.props.eyebrow ? "featured" : ""} `,
                            { opened: this.state.isExpanded })
                    }
                    onClick={() => this.setState({ isExpanded: !this.state?.isExpanded })}
                >
                    <div className="margin-r-t">
                        <div className="header--expanded__dropdown-eyebrow margin-b-2">{this.props.eyebrow}</div>
                        <div className="header--expanded__dropdown-label">{this.props.label}</div>
                    </div>
                    <div className="header--expanded__dropdown-icon">
                        <DropdownIcon />
                    </div>
                </div>
                {this.state.isExpanded && (
                    <div className="header--expanded__content">
                        {this.props.children}
                    </div>
                )}
            </div>
        );
    }
}

export default HeaderExpanded;
