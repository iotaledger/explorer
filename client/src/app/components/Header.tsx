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
        const CHRYSALIS_NETWORKS = this.props.networks?.filter(
            n => n.protocolVersion === "chrysalis"
        );
        const LEGACY_NETWORKS = this.props.networks?.filter(
            n => n.protocolVersion === "og"
        );

        const PROTOCOLS = [
            {
                label: "IOTA 1.5 (Chrysalis)",
                description:
                    "Short Chrysalis network description that explains what Chrysalis is.",
                networks: CHRYSALIS_NETWORKS
            },
            {
                label: "IOTA 1.0 (Legacy)",
                description:
                    "Short Coordicide network description that explains what Coordicide is.",
                networks: LEGACY_NETWORKS
            }
        ];
        return (
            <header>
                <nav className="inner">
                    <div className="inner--main">
                        <Link
                            to={this.props.rootPath}
                            onClick={() => this.resetExpandedDropdowns()}
                            className="logo-image--wrapper"
                        >
                            <LogoHeader />
                        </Link>
                        {this.props.pages &&
                            this.props.pages.length > 0 &&
                            this.props.pages.map(page => (
                                <Link
                                    key={page.url}
                                    to={page.url}
                                    onClick={() => this.setState({
                                        isUtilitiesExpanded: false,
                                        isNetworkSwitcherExpanded: false
                                    })}
                                    className={classNames("navigation--item",
                                        { "active-item": page.url === window.location.pathname })}
                                >
                                    {page.label}
                                </Link>
                            ))}
                        <div className="utilities--wrapper">
                            <div
                                className={classNames("utilities--dropdown", {
                                    opened: this.state.isUtilitiesExpanded
                                })}
                                onClick={() =>
                                    this.setState({
                                        isUtilitiesExpanded: !this.state.isUtilitiesExpanded,
                                        isNetworkSwitcherExpanded: false
                                    })}
                            >
                                <div className="label">Utilities</div>
                                <div className="icon">
                                    <DropdownIcon />
                                </div>
                            </div>

                            <div className={classNames("header--expanded", {
                                opened: this.state.isUtilitiesExpanded
                            })}
                            >
                                <div className="utilities">
                                    <div className="utilities--label">Utilities</div>
                                    {this.props.utilities?.map(utility => (
                                        <div key={utility.url} className="utilities--item">
                                            <Link
                                                to={utility.url}
                                                onClick={() =>
                                                    this.setState({ isUtilitiesExpanded: false })}
                                                className={classNames(
                                                    { "active-item": utility.url === window.location.pathname }
                                                )}
                                            >
                                                {utility.label}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {this.state.isUtilitiesExpanded && (
                                <div
                                    className="header--expanded--shield"
                                    onClick={() =>
                                        this.setState({ isUtilitiesExpanded: false })}
                                />
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
                                onClick={() =>
                                    this.setState({ isMenuExpanded: !this.state.isMenuExpanded })}
                            >
                                {this.state.isMenuExpanded ? <CloseIcon /> : <HamburgerIcon />}
                            </button>
                            <div
                                className={classNames("menu--expanded", {
                                    opened: this.state.isMenuExpanded
                                })}
                            >
                                <ul>
                                    {this.props.pages &&
                                        this.props.pages.length > 0 &&
                                        this.props.pages.map(page => (
                                            <Link
                                                key={page.url}
                                                to={page.url}
                                                onClick={() => this.resetExpandedDropdowns()}
                                            >
                                                <li className="menu--expanded__item" key={page.url}>
                                                    <span
                                                        className={classNames(
                                                            { "active-item": page.url === window.location.pathname }
                                                        )}
                                                    >
                                                        {page.label}
                                                    </span>
                                                </li>
                                            </Link>

                                        ))}
                                    <li
                                        className={classNames("menu--expanded__item", {
                                            opened: this.state.isUtilitiesExpanded
                                        })}
                                        onClick={() =>
                                            this.setState({
                                                isUtilitiesExpanded: !this.state.isUtilitiesExpanded
                                            })}
                                    >
                                        <div className="label">Utilities</div>
                                        <div className="icon">
                                            <DropdownIcon />
                                        </div>
                                    </li>
                                    {/* ----- Only visible in mobile ----- */}
                                    <div className={classNames("utilities--mobile", {
                                        opened: this.state.isUtilitiesExpanded
                                    })}
                                    >
                                        {this.props.utilities?.map(utility => (
                                            <Link
                                                key={utility.url}
                                                to={utility.url}
                                                onClick={() =>
                                                    this.setState({
                                                        isMenuExpanded: false,
                                                        isNetworkSwitcherExpanded: false
                                                    })}
                                            >
                                                <li
                                                    key={utility.url}
                                                    className={classNames("menu--expanded__item margin-l-t",
                                                        { "active-item": utility.url === window.location.pathname })}
                                                >
                                                    {utility.label}
                                                </li>
                                            </Link>
                                        ))}
                                    </div>
                                    {/* ---------- */}
                                </ul>
                            </div>
                            {/* )} */}
                        </div>
                    </div>
                    <div className="inner--networks">
                        <NetworkSwitcher
                            eyebrow="Selected network"
                            label={this.props.network?.label}
                            protocols={PROTOCOLS}
                            isExpanded={this.state.isNetworkSwitcherExpanded}
                            onClick={() => {
                                this.setState({
                                    isNetworkSwitcherExpanded:
                                        !this.state.isNetworkSwitcherExpanded,
                                    isUtilitiesExpanded: false
                                });
                            }}
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
                </nav>
            </header >
        );
    }

    /**
     * Close expanded dropdowns
     */
    private resetExpandedDropdowns(): void {
        this.setState({
            isUtilitiesExpanded: false,
            isNetworkSwitcherExpanded: false,
            isMenuExpanded: false
        });
    }
}

export default Header;
