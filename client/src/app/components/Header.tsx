import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as LogoHeader } from "../../assets/logo-header.svg";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import { ReactComponent as CloseIcon } from "./../../assets/close.svg";
import { ReactComponent as DarkModeIcon } from "./../../assets/dark-mode.svg";
import { ReactComponent as HamburgerIcon } from "./../../assets/hamburger.svg";
import { ReactComponent as LightModeIcon } from "./../../assets/light-mode.svg";
import FiatSelector from "./FiatSelector";
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
            isUtilitiesExpanded: false,
            isMenuExpanded: false
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
                    <div className="inner--main">
                        <Link
                            to={this.props.rootPath}
                            onClick={() => this.setState({ isUtilitiesExpanded: false })}
                            className="logo-image--wrapper"
                        >
                            <LogoHeader />
                        </Link>
                        {this.props.pages && this.props.pages.length > 0 && this.props.pages.map(page => (
                            <Link
                                key={page.url}
                                to={page.url}
                                onClick={() => this.setState({ isUtilitiesExpanded: false })}
                                className={`navigation--item ${page.url === window.location.pathname ? "active" : ""}`}
                            >
                                {page.label}
                            </Link>
                        ))}
                        <div
                            className="utilities--wrapper"
                        >
                            <div
                                className={classNames("utilities--dropdown", {
                                    opened: this.state.isUtilitiesExpanded
                                })}
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
                        {/* ----- Only visible in mobile ----- */}
                        <div className="mobile-fiat">
                            <FiatSelector />
                        </div>
                        {/* ---------- */}

                        {this.props.search}

                        {/* ----- Only visible in desktop ----- */}
                        <div className="desktop-fiat">
                            <FiatSelector />
                        </div>
                        {/* ---------- */}
                        <button
                            type="button"
                            className="button--unstyled theme-toggle"
                            onClick={this.props?.toggleMode}
                        >
                            {this.props.darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </button>
                        <div className="hamburger--menu">
                            <button
                                type="button"
                                className="button--unstyled hamburger--menu__icon"
                                onClick={() => this.setState({ isMenuExpanded: !this.state.isMenuExpanded })}
                            >
                                {this.state.isMenuExpanded ? <CloseIcon /> : <HamburgerIcon />}
                            </button>
                            {this.state.isMenuExpanded && (
                                <div className="menu--expanded">
                                    <ul>
                                        {this.props.pages &&
                                            this.props.pages.length > 0 && this.props.pages.map(page => (
                                                <li className="menu--expanded__item" key={page.url}>
                                                    <Link
                                                        to={page.url}
                                                        onClick={() => this.setState({ isMenuExpanded: false })}
                                                    >
                                                        <span
                                                            className={` 
                                                    ${page.url === window.location.pathname
                                                                    ? "active" : ""}`}
                                                        >
                                                            {page.label}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        <li
                                            className={classNames("menu--expanded__item",
                                                { opened: this.state.isUtilitiesExpanded }
                                            )}
                                            onClick={() => this.setState(
                                                { isUtilitiesExpanded: !this.state.isUtilitiesExpanded }
                                            )}
                                        >

                                            <div className="label">
                                                Utilities
                                            </div>
                                            <div className="icon">
                                                <DropdownIcon />
                                            </div>
                                        </li>
                                        {this.state.isUtilitiesExpanded && (
                                            <React.Fragment>
                                                <div className="utilities">
                                                    {this.props.utilities?.map(utility => (
                                                        <li
                                                            key={utility.url}
                                                            className="menu--expanded__item margin-l-t"
                                                        >
                                                            <Link
                                                                key={utility.url}
                                                                to={utility.url}
                                                                onClick={() => this.setState(
                                                                    {
                                                                        isMenuExpanded: false,
                                                                        isUtilitiesExpanded: false
                                                                    }
                                                                )}
                                                            >
                                                                {utility.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </div>
                                                <div
                                                    className="header--expanded--shield"
                                                    onClick={() => this.setState({ isUtilitiesExpanded: false })}
                                                />
                                            </React.Fragment>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="inner--networks">
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
                    </div>
                </nav >
            </header >
        );
    }
}

export default Header;
