import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import { ReactComponent as DevnetIcon } from "./../../assets/devnet.svg";
import { ReactComponent as MainnetIcon } from "./../../assets/mainnet.svg";
import "./NetworkSwitcher.scss";
import { NetworkSwitcherProps } from "./NetworkSwitcherProps";


/**
 * Component which will show the switcher.
 */
class NetworkSwitcher extends Component<NetworkSwitcherProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="network--switcher">
                <div
                    className={classNames("network--switcher__header row middle space-between",
                        { opened: this.props.isExpanded })}
                    onClick={this.props.onClick}
                >
                    <div className="network--switcher__dropdown">
                        <div className="eyebrow">{this.props.eyebrow}</div>
                        <div className="label">{this.props.label}</div>
                    </div>
                    <div className="icon">
                        <DropdownIcon />
                    </div>


                    <div className={classNames("header--expanded", {
                        opened: this.props.isExpanded
                    })}
                    >
                        <div className="protocols">
                            {this.props.protocols.map(protocol => (
                                <div className="protocol" key={protocol.label}>
                                    <div >
                                        <div className="protocol--title">{protocol.label}</div>
                                        <div className="protocol--description">
                                            {protocol.description}
                                        </div>
                                    </div>
                                    <div className="network--cards">
                                        {protocol.networks?.map(n => (
                                            <div
                                                className={classNames("network--card row middle",
                                                    {
                                                        selected: n.label ===
                                                            this.props.label
                                                    })}
                                                onClick={() => this.props.onChange(n.network)}
                                                key={n.label}
                                            >
                                                <div className="network--icon row middle center">
                                                    {n.network.includes("mainnet")
                                                        ? <MainnetIcon />
                                                        : <DevnetIcon />}
                                                </div>
                                                <div className="network--content">
                                                    <div className="label">{n.label}</div>
                                                    <div className="description">
                                                        {n.description}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {this.props.isExpanded && (
                        <div
                            className="header--expanded--shield"
                            onClick={this.props.onClick}
                        />
                    )}

                </div>
            </div >
        );
    }
}

export default NetworkSwitcher;
