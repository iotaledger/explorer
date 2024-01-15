/* eslint-disable react/jsx-closing-tag-location */
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { HeaderProps } from "./HeaderProps";
import { HeaderState } from "./HeaderState";
import Logo from "~assets/logo-header.svg?react";
import mainChrysalisMessage from "~assets/modals/chrysalis/search/main-header.json";
import mainLegacyMessage from "~assets/modals/legacy/search/main-header.json";
import mainStardustMessage from "~assets/modals/stardust/search/main-header.json";
import ShimmerLogo from "~assets/shimmer-logo-header.svg?react";
import { ServiceFactory } from "~factories/serviceFactory";
import { isMarketedNetwork, isShimmerUiTheme } from "~helpers/networkHelper";
import { CHRYSALIS, LEGACY, STARDUST } from "~models/config/protocolVersion";
import { SettingsService } from "~services/settingsService";
import FiatSelector from "../FiatSelector";
import "./Header.scss";
import Modal from "../Modal";
import NetworkSwitcher from "../NetworkSwitcher";

/**
 * Component which will show the header.
 */
class Header extends Component<HeaderProps, HeaderState> {
    /**
     * Settings service.
     */
    private readonly _settingsService: SettingsService;

    /**
     * Create a new instance of Header.
     * @param props The props.
     */
    constructor(props: HeaderProps) {
        super(props);

        this._settingsService = ServiceFactory.get<SettingsService>("settings");

        this.state = {
            isNetworkSwitcherExpanded: false,
            isEvmDropdownExpanded: false,
            isMenuExpanded: false,
            darkMode: this._settingsService.get().darkMode ?? false,
            show: false,
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        if (this.state.darkMode) {
            this.toggleModeClass();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { rootPath, currentNetwork, networks, history, action, search, pages } = this.props;
        const isShimmerUi = isShimmerUiTheme(currentNetwork?.uiTheme);
        const isMarketed = isMarketedNetwork(currentNetwork?.network);

        const EVM_EXPLORER_DROPDOWN = {
            label: "EVM Explorer",
            routes: [
                {
                    label: "EVM Explorer",
                    url: "https://explorer.evm.shimmer.network/",
                },
                {
                    label: "EVM Explorer Testnet",
                    url: "https://explorer.evm.testnet.shimmer.network/",
                },
            ],
        };

        return (
            <header className={classNames({ "full-height": this.state.show })}>
                <nav className="inner">
                    <div className="inner--main">
                        <div className="inner-wrapper">
                            <Link to={rootPath} onClick={() => this.resetExpandedDropdowns()} className="logo-image--wrapper">
                                {isShimmerUi ? (
                                    <React.Fragment>
                                        <div className="shimmer-logo">
                                            <ShimmerLogo />
                                        </div>
                                        <h2 className="shimmer-heading">EXPLORER</h2>
                                    </React.Fragment>
                                ) : (
                                    <Logo />
                                )}
                            </Link>
                            {pages &&
                                pages.length > 0 &&
                                pages.map((page) => (
                                    <Link
                                        key={page.url}
                                        to={page.url}
                                        onClick={() =>
                                            this.setState({
                                                isEvmDropdownExpanded: false,
                                                isNetworkSwitcherExpanded: false,
                                            })
                                        }
                                        className={classNames("navigation--item", { "active-item": page.url === window.location.pathname })}
                                    >
                                        {page.label}
                                    </Link>
                                ))}
                            {/* EVM DROPDOWN */}
                            <div className="utilities--wrapper">
                                <div
                                    className={classNames("utilities--dropdown", {
                                        opened: this.state.isEvmDropdownExpanded,
                                    })}
                                    onClick={() =>
                                        this.setState({
                                            isEvmDropdownExpanded: !this.state.isEvmDropdownExpanded,
                                            isNetworkSwitcherExpanded: false,
                                        })
                                    }
                                >
                                    <div className="label">{EVM_EXPLORER_DROPDOWN.label}</div>
                                    <div className="icon">
                                        <span className="material-icons">expand_more</span>
                                    </div>
                                </div>

                                <div
                                    className={classNames("header--expanded", {
                                        opened: this.state.isEvmDropdownExpanded,
                                    })}
                                >
                                    <div className="utilities">
                                        <div className="utilities--label">{EVM_EXPLORER_DROPDOWN.label}</div>
                                        {EVM_EXPLORER_DROPDOWN.routes.map((route) => (
                                            <div key={route.url} className="utilities--item">
                                                <Link
                                                    to={route.url}
                                                    onClick={() => this.setState({ isEvmDropdownExpanded: false })}
                                                    className={classNames({ "active-item": route.url === window.location.pathname })}
                                                >
                                                    {route.label}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {this.state.isEvmDropdownExpanded && (
                                    <div
                                        className="header--expanded--shield"
                                        onClick={() => this.setState({ isEvmDropdownExpanded: false })}
                                    />
                                )}
                            </div>
                            {/* ----- Only visible in mobile ----- */}
                            {isMarketed && (
                                <div className="mobile-fiat">
                                    <FiatSelector />
                                </div>
                            )}
                            {/* ---------- */}

                            {search}
                            {currentNetwork?.protocolVersion === LEGACY && (
                                <Modal icon="info" data={mainLegacyMessage} showModal={(show) => this.setState({ show })} />
                            )}
                            {currentNetwork?.protocolVersion === CHRYSALIS && (
                                <Modal icon="info" data={mainChrysalisMessage} showModal={(show) => this.setState({ show })} />
                            )}
                            {currentNetwork?.protocolVersion === STARDUST && (
                                <Modal icon="info" data={mainStardustMessage} showModal={(show) => this.setState({ show })} />
                            )}

                            {/* ----- Only visible in desktop ----- */}
                            {isMarketed && (
                                <div className="desktop-fiat">
                                    <FiatSelector />
                                </div>
                            )}
                        </div>
                        {/* ---------- */}
                        <button type="button" className="button--unstyled theme-toggle" onClick={() => this.toggleMode()}>
                            {this.state.darkMode ? (
                                <span className="material-icons">light_mode</span>
                            ) : (
                                <span className="material-icons">dark_mode</span>
                            )}
                        </button>
                        <div className="hamburger--menu">
                            <button
                                type="button"
                                className="button--unstyled hamburger--menu__icon"
                                onClick={() => this.setState({ isMenuExpanded: !this.state.isMenuExpanded })}
                            >
                                {this.state.isMenuExpanded ? (
                                    <span className="material-icons">close</span>
                                ) : (
                                    <span className="material-icons"> menu</span>
                                )}
                            </button>
                            <div
                                className={classNames("menu--expanded", {
                                    opened: this.state.isMenuExpanded,
                                })}
                            >
                                <ul>
                                    {pages &&
                                        pages.length > 0 &&
                                        pages.map((page) => (
                                            <Link key={page.url} to={page.url} onClick={() => this.resetExpandedDropdowns()}>
                                                <li className="menu--expanded__item" key={page.url}>
                                                    <span className={classNames({ "active-item": page.url === window.location.pathname })}>
                                                        {page.label}
                                                    </span>
                                                </li>
                                            </Link>
                                        ))}
                                    <li
                                        className={classNames("menu--expanded__item", {
                                            opened: this.state.isEvmDropdownExpanded,
                                        })}
                                        onClick={() =>
                                            this.setState({
                                                isEvmDropdownExpanded: !this.state.isEvmDropdownExpanded,
                                            })
                                        }
                                    >
                                        <div className="label">{EVM_EXPLORER_DROPDOWN.label}</div>
                                        <div className="icon">
                                            <span className="material-icons">expand_more</span>
                                        </div>
                                    </li>
                                    {/* ----- EVM DROPDOWN MOBILE ----- */}
                                    <div
                                        className={classNames("utilities--mobile", {
                                            opened: this.state.isEvmDropdownExpanded,
                                        })}
                                    >
                                        {EVM_EXPLORER_DROPDOWN.routes.map((route) => (
                                            <Link
                                                key={route.url}
                                                to={route.url}
                                                onClick={() =>
                                                    this.setState({
                                                        isMenuExpanded: false,
                                                        isNetworkSwitcherExpanded: false,
                                                    })
                                                }
                                            >
                                                <li
                                                    key={route.url}
                                                    className={classNames("menu--expanded__item margin-l-t", {
                                                        "active-item": route.url === window.location.pathname,
                                                    })}
                                                >
                                                    {route.label}
                                                </li>
                                            </Link>
                                        ))}
                                    </div>
                                    {/* ---------- */}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="inner--networks">
                        <NetworkSwitcher
                            eyebrow="Network"
                            label={currentNetwork?.label}
                            networks={networks}
                            isExpanded={this.state.isNetworkSwitcherExpanded}
                            onClick={() => {
                                this.setState({
                                    isNetworkSwitcherExpanded: !this.state.isNetworkSwitcherExpanded,
                                    isEvmDropdownExpanded: false,
                                });
                            }}
                            onChange={(targetNetwork) => {
                                history?.push(
                                    action === "streams"
                                        ? `/${targetNetwork}/streams/0/`
                                        : action === "visualizer"
                                          ? `/${targetNetwork}/visualizer/`
                                          : `/${targetNetwork}`,
                                );
                            }}
                        />
                    </div>
                </nav>
            </header>
        );
    }

    /**
     * Close expanded dropdowns
     */
    private resetExpandedDropdowns(): void {
        this.setState({
            isEvmDropdownExpanded: false,
            isNetworkSwitcherExpanded: false,
            isMenuExpanded: false,
        });
    }

    /**
     * Toggle the display mode.
     */
    private toggleMode(): void {
        this.setState(
            {
                darkMode: !this.state.darkMode,
            },
            () => {
                this._settingsService.saveSingle("darkMode", this.state.darkMode);
                const event = new CustomEvent("theme-change", { detail: { darkMode: this.state.darkMode } });
                window.dispatchEvent(event);
            },
        );
        this.toggleModeClass();
    }

    /**
     * Toggle darkmode classname to the body DOM node
     */
    private toggleModeClass(): void {
        const body = document.querySelector("body");
        body?.classList.toggle("darkmode");
    }
}

export default Header;
