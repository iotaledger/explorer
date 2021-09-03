import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoHeader from "../../assets/logo-header.svg";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import "./Header.scss";
import { HeaderProps } from "./HeaderProps";
import { HeaderState } from "./HeaderState";
import NetworkSwitcher from "./NetworkSwitcher";
/**
 * Component which will show the header.
 */
class Header extends Component<HeaderProps, HeaderState> {
    /**
     * Create a new instance of Header.
     * @param props The props.
     */
    constructor(props: HeaderProps) {
        super(props);

        this.state = {
            isNetworkSwitcherExpanded: false,
            isUtilitiesExpanded: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const CHRYSALIS_NETWORKS = this.props.networks?.filter(n => n.protocolVersion === "chrysalis");
        const LEGACY_NETWORKS = this.props.networks?.filter(n => n.protocolVersion === "og");

        const PROTOCOLS = [
            {
                label: "IOTA 1.5 (Chrysalis)",
                description: "Short Chrysalis network description that explains what Chrysalis is.",
                networks: CHRYSALIS_NETWORKS
            },
            {
                label: "IOTA 1.0 (Legacy)",
                description: "Short Coordicide network description that explains what Coordicide is.",
                networks: LEGACY_NETWORKS
            }
        ];

        return (
            <header>
                <nav className="inner">
                    <Link
                        to={this.props.rootPath}
                        onClick={() => this.setState({ isUtilitiesExpanded: false })}
                    >
                        <img className="logo-image" src={logoHeader} alt="Explorer" />
                    </Link>
                    {this.props.pages && this.props.pages.length > 0 && this.props.pages.map(page => (
                        <Link
                            key={page.url}
                            to={page.url}
                            onClick={() => this.setState({ isUtilitiesExpanded: false })}
                        >
                            <span
                                className={`page margin-l-s ${page.url === window.location.pathname ? "active" : ""}`}
                            >
                                {page.label}
                            </span>
                        </Link>
                    ))}
                    <div
                        className="utilities--wrapper"
                    >
                        <div
                            className={classNames("utilities--dropdown", { opened: this.state.isUtilitiesExpanded })}
                            onClick={() => this.setState(
                                {
                                    isUtilitiesExpanded: !this.state.isUtilitiesExpanded,
                                    isNetworkSwitcherExpanded: false
                                }
                            )}
                        >
                            <div className="label">
                                Utilities
                            </div>
                            <div className="icon">
                                <DropdownIcon />
                            </div>
                        </div>
                        {this.state.isUtilitiesExpanded && (
                            <React.Fragment>
                                <div className="header--expanded">
                                    <div className="utilities">
                                        <div className="utilities--label">Utilities</div>
                                        {this.props.utilities?.map(utility => (
                                            <div
                                                key={utility.url}
                                                className="utilities--item"
                                            >
                                                <Link
                                                    to={utility.url}
                                                    onClick={() => this.setState({ isUtilitiesExpanded: false })}
                                                >
                                                    {utility.label}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    className="header--expanded--shield"
                                    onClick={() => this.setState({ isUtilitiesExpanded: false })}
                                />
                            </React.Fragment>
                        )}
                    </div>
                    {this.props.search}
                    <NetworkSwitcher
                        eyebrow="Selected network"
                        label={this.props.network?.label}
                        protocols={PROTOCOLS}
                        isExpanded={this.state.isNetworkSwitcherExpanded}
                        onClick={
                            () => {
                                this.setState(
                                    {
                                        isNetworkSwitcherExpanded: !this.state.isNetworkSwitcherExpanded,
                                        isUtilitiesExpanded: false
                                    }
                                );
                            }
                        }
                        onChange={network => {
                            this.props.history?.push(
                                this.props.action === "streams"
                                    ? `/${network}/streams/0/`
                                    : (this.props.action === "visualizer"
                                        ? `/${network}/visualizer/`
                                        : `/${network}`)
                            );
                        }}
                    />
                </nav >
            </header >
        );
    }
}

export default Header;
