import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import { ReactComponent as DevnetIcon } from "./../../assets/devnet.svg";
import { ReactComponent as MainnetIcon } from "./../../assets/mainnet.svg";
import "./Switcher.scss";
import { SwitcherProps } from "./SwitcherProps";
import { SwitcherState } from "./SwitcherState";


/**
 * Component which will show the switcher.
 */
class Switcher extends Component<SwitcherProps, SwitcherState> {
    /**
     * Create a new instance of Switcher.
     * @param props The props.
     */
    constructor(props: SwitcherProps) {
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
            <nav>
                {!this.props.isDropdown && (
                    <nav className="switcher">
                        {/* {this.props.groups.map(group => (
                            <button
                                type="button"
                                key={item.value}
                                className={classNames({
                                    selected: item.value === this.props.value
                                })}
                                onClick={() => this.props.onChange(item.value)}
                                disabled={this.props.disabled}
                            >
                                {item.label}
                            </button>
                        ))} */}
                        <p>No dropdown</p>
                    </nav>
                )}

                {this.props.isDropdown && (
                    <React.Fragment>
                        <div
                            className="switcher--dropdown"
                            onClick={() => this.setState({ isExpanded: !this.state?.isExpanded })}
                        >
                            <div>{this.props.eyebrow ? this.props.eyebrow : ""}</div>
                            <div>{this.props.label ? this.props.label : ""}</div>
                            <div className={classNames({ opened: this.state.isExpanded })}>
                                <DropdownIcon />
                            </div>
                        </div>
                        {this.state.isExpanded && (
                            <div className="switcher--expanded__content">
                                {
                                    this.props.groups.map(group => (
                                        <div
                                            key={group.label}
                                            className="group"
                                            style={{ width: `${100 / this.props.groups.length}%` }}
                                        >
                                            <div>{group.label}</div>
                                            <div>{group.description}</div>

                                            {group.items.map(item => (

                                                item?.icon && (
                                                    <div key={item.value}>
                                                        <div>Description: {item?.description}</div>
                                                        <button
                                                            type="button"
                                                            className={classNames({
                                                                selected: item.value === this.props.value
                                                            })}
                                                            onClick={() => this.props.onChange(item.value)}
                                                            disabled={this.props.disabled}
                                                        >
                                                            {item.label}
                                                        </button>
                                                        {item.icon === "mainnet" ? (<MainnetIcon />) : (<DevnetIcon />)}
                                                    </div>
                                                )

                                            )
                                            )}
                                        </div>
                                    ))
                                }
                                <div className="switcher-bg" onClick={() => this.setState({ isExpanded: false })} />
                            </div>
                        )}

                    </React.Fragment>
                )}
            </nav>
        );
    }
}

export default Switcher;
