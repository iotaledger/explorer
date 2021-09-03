import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoHeader from "../../assets/logo-header.svg";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import "./Header.scss";
import { HeaderProps } from "./HeaderProps";
import { HeaderState } from "./HeaderState";
import { ReactComponent as DevnetIcon } from "./../../assets/devnet.svg";
import { ReactComponent as MainnetIcon } from "./../../assets/mainnet.svg";
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
                            onClick={() => this.setState({ isUtilitiesExpanded: !this.state.isUtilitiesExpanded })}
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
                    <div className="network--switcher">
                        {/* {this.props.switcher} */}
                        <div
                            className="network--switcher__header row middle"
                            onClick={
                                () =>
                                    this.setState(
                                        { isNetworkSwitcherExpanded: !this.state.isNetworkSwitcherExpanded }
                                    )
                            }
                        >
                            <div
                                className="network--switcher__dropdown"
                            >
                                <div className="eyebrow">Selected Network</div>
                                <div className="label">{this.props.network?.label}</div>
                            </div>
                            <div className="icon margin-l-t">
                                <DropdownIcon />
                            </div>
                            {this.state.isNetworkSwitcherExpanded &&
                                (
                                    <React.Fragment>
                                        <div className="header--expanded">
                                            <div className="protocol">
                                                <div>
                                                    <div className="protocol--title">IOTA 1.5 (Chrysalis)</div>
                                                    <div className="protocol--description">
                                                        Short protocol description
                                                    </div>
                                                </div>
                                                <div className="network-cards">
                                                    {this.props.networks?.map(n => (
                                                        n.protocolVersion === "chrysalis" && (
                                                            <div
                                                                className="network-card"
                                                                onClick={() => {
                                                                    this.props.history?.push(
                                                                        this.props.action === "streams"
                                                                            ? `/${n.network}/streams/0/`
                                                                            : (this.props.action === "visualizer"
                                                                                ? `/${n.network}/visualizer/`
                                                                                : `/${n.network}`)
                                                                    );
                                                                }}
                                                            >
                                                                <div className="icon">
                                                                    {n.network.includes("mainnet")
                                                                        ? <MainnetIcon />
                                                                        : <DevnetIcon />}
                                                                </div>
                                                                <div className="network-content">
                                                                    <div className="label">{n.label}</div>
                                                                    <div className="description">
                                                                        {n.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}

                                                </div>
                                            </div>
                                            <div className="protocol">
                                                <div>
                                                    <div className="protocol--title">IOTA 1.0 (Legacy)</div>
                                                    <div className="protocol--description">Short description</div>
                                                </div>
                                                <div className="network-cards">
                                                    {this.props.networks?.map(n => (
                                                        n.protocolVersion === "og" && (
                                                            <div
                                                                className="network-card"
                                                                onClick={() => {
                                                                    this.props.history?.push(
                                                                        this.props.action === "streams"
                                                                            ? `/${n.network}/streams/0/`
                                                                            : (this.props.action === "visualizer"
                                                                                ? `/${n.network}/visualizer/`
                                                                                : `/${n.network}`)
                                                                    );
                                                                }}
                                                            >
                                                                <div className="icon">
                                                                    {n.network.includes("mainnet")
                                                                        ? <MainnetIcon />
                                                                        : <DevnetIcon />}
                                                                </div>
                                                                <div className="network-content">
                                                                    <div className="label">{n.label}</div>
                                                                    <div className="description">
                                                                        {n.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}

                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="header--expanded--shield"
                                            onClick={() => this.setState({ isNetworkSwitcherExpanded: false })}
                                        />
                                    </React.Fragment>
                                )}
                        </div>
                    </div>
                </nav >
            </header >
        );
    }
}

export default Header;
