import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import closeIcon from "../../assets/close.svg";
import hamburgerIcon from "../../assets/hamburger.svg";
import logoHeaderMobile from "../../assets/logo-header-mobile.svg";
import logoHeader from "../../assets/logo-header.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { SettingsService } from "../../services/settingsService";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import CurrencyButton from "./CurrencyButton";
import "./Header.scss";
import { HeaderProps } from "./HeaderProps";
import { HeaderState } from "./HeaderState";
import NetworkSwitcher from "./NetworkSwitcher";


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
            isUtilitiesExpanded: false,
            isMenuExpanded: false,
            darkMode: this._settingsService.get().darkMode ?? false
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
                        <img className="logo-image-mobile" src={logoHeaderMobile} alt="Explorer" />
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
                    <CurrencyButton
                        onlyFiatSelect
                    />
                    <button
                        type="button"
                        className="card--action margin-l-s"
                        onClick={() => this.toggleMode()}
                    >
                        {this.state.darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <div className="hamburger--menu">
                        <div
                            className="hamburger--menu__icon"
                            onClick={() => this.setState({ isMenuExpanded: !this.state.isMenuExpanded })}
                        >
                            <img src={this.state.isMenuExpanded ? closeIcon : hamburgerIcon} alt="Hamburger menu" />
                        </div>
                        {this.state.isMenuExpanded && (
                            <div className="menu--expanded">
                                <ul>
                                    {this.props.pages && this.props.pages.length > 0 && this.props.pages.map(page => (
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
                                                    <li key={utility.url} className="menu--expanded__item margin-l-t">
                                                        <Link
                                                            key={utility.url}
                                                            to={utility.url}
                                                            onClick={() => this.setState(
                                                                { isMenuExpanded: false, isUtilitiesExpanded: false }
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

    /**
     * Toggle the display mode.
     */
    private toggleMode(): void {
        this.setState({
            darkMode: !this.state.darkMode
        }, () => {
            this._settingsService.saveSingle("darkMode", this.state.darkMode);
        });
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
