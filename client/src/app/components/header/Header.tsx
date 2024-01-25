import React, { useEffect, useState } from "react";
import * as H from "history";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Logo from "~assets/logo-header.svg?react";
import mainChrysalisMessage from "~assets/modals/chrysalis/search/main-header.json";
import mainLegacyMessage from "~assets/modals/legacy/search/main-header.json";
import mainStardustMessage from "~assets/modals/stardust/search/main-header.json";
import ShimmerLogo from "~assets/shimmer-logo-header.svg?react";
import { ServiceFactory } from "~factories/serviceFactory";
import { isMarketedNetwork, isShimmerUiTheme } from "~helpers/networkHelper";
import { CHRYSALIS, LEGACY, ProtocolVersion, STARDUST } from "~models/config/protocolVersion";
import { SettingsService } from "~services/settingsService";
import FiatSelector from "../FiatSelector";
import Modal from "../Modal";
import NetworkSwitcher from "../NetworkSwitcher";
import { INetwork } from "~/models/config/INetwork";
import SearchInput from "../SearchInput";
import "./Header.scss";
import GroupDropdown from "./HeaderDropdown";

const NETWORK_DROPDOWN_LABEL = "Network Switcher";

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

interface IHeader {
    rootPath: string;
    currentNetwork?: INetwork;
    networks: INetwork[];
    history?: H.History;
    action?: string;
    protocolVersion: ProtocolVersion;
    pages?: Route[];
}

export type Route = IRoute | IGroupRoute;

export interface IRoute {
    label: string;
    url: string;
}

export interface IGroupRoute {
    label: string;
    isExpanded: boolean;
    setExpandedDropdownId: (state?: string) => void;
    routes: IRoute[];
}

export default function Header({ rootPath, currentNetwork, networks, history, action, protocolVersion, pages }: IHeader) {
    const settingsService = ServiceFactory.get<SettingsService>("settings");

    const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
    const [darkMode, setDarkMode] = useState<boolean>(settingsService.get().darkMode ?? false);
    const [show, setShow] = useState<boolean>(false);
    const [expandedDropdownLabel, setExpandedDropdownLabel] = useState<string | undefined>();

    const isEvmDropdownExpanded = expandedDropdownLabel === EVM_EXPLORER_DROPDOWN.label;
    const isNetworkSwitcherExpanded = expandedDropdownLabel === NETWORK_DROPDOWN_LABEL;
    const isShimmerUi = isShimmerUiTheme(currentNetwork?.uiTheme);
    const isMarketed = isMarketedNetwork(currentNetwork?.network);

    useEffect(() => {
        toggleModeClass();
    }, []);

    /**
     * Toggle the display mode.
     */
    function toggleMode(): void {
        setDarkMode((darkMode) => !darkMode);
        settingsService.saveSingle("darkMode", darkMode);
        const event = new CustomEvent("theme-change", { detail: { darkMode: darkMode } });
        window.dispatchEvent(event);
        toggleModeClass();
    }

    function toggleModeClass(): void {
        const body = document.querySelector("body");
        if (body) {
            body.classList.toggle("darkmode", darkMode);
        }
    }

    function resetExpandedDropdowns(e?: React.MouseEvent): void {
        setIsMenuExpanded(false);
        closeDropdowns();
    }

    function closeDropdowns(e?: React.MouseEvent): void {
        setExpandedDropdownLabel(undefined);
    }

    function toggleNetworkSwitcher(): void {
        setExpandedDropdownLabel(isNetworkSwitcherExpanded ? undefined : NETWORK_DROPDOWN_LABEL);
    }

    function routeIsDropdown(route: Route): route is IGroupRoute {
        return Object.prototype.hasOwnProperty.call(route, "routes");
    }

    return (
        <header className={classNames({ "full-height": show })}>
            <nav className="inner">
                <div className="inner--main">
                    <div className="inner-wrapper">
                        <Link to={rootPath} onClick={resetExpandedDropdowns} className="logo-image--wrapper">
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
                            pages.map(
                                (page) =>
                                    !routeIsDropdown(page) && (
                                        <Link
                                            key={page.url}
                                            to={page.url}
                                            onClick={closeDropdowns}
                                            className={classNames("navigation--item", {
                                                "active-item": page.url === window.location.pathname,
                                            })}
                                        >
                                            {page.label}
                                        </Link>
                                    ),
                            )}
                        {/* EVM DROPDOWN */}

                        <GroupDropdown
                            {...EVM_EXPLORER_DROPDOWN}
                            isExpanded={expandedDropdownLabel === EVM_EXPLORER_DROPDOWN.label}
                            setExpandedDropdownId={setExpandedDropdownLabel}
                        />
                        {/* ----- Only visible in mobile ----- */}
                        {isMarketed && (
                            <div className="mobile-fiat">
                                <FiatSelector />
                            </div>
                        )}
                        {/* ---------- */}

                        <SearchInput
                            onSearch={(query) => history?.push(`/${currentNetwork?.network}/search/${query}`)}
                            protocolVersion={protocolVersion}
                        />
                        {currentNetwork?.protocolVersion === LEGACY && <Modal icon="info" data={mainLegacyMessage} showModal={setShow} />}
                        {currentNetwork?.protocolVersion === CHRYSALIS && (
                            <Modal icon="info" data={mainChrysalisMessage} showModal={setShow} />
                        )}
                        {currentNetwork?.protocolVersion === STARDUST && (
                            <Modal icon="info" data={mainStardustMessage} showModal={setShow} />
                        )}

                        {/* ----- Only visible in desktop ----- */}
                        {isMarketed && (
                            <div className="desktop-fiat">
                                <FiatSelector />
                            </div>
                        )}
                    </div>
                    {/* ---------- */}
                    <button type="button" className="button--unstyled theme-toggle" onClick={() => toggleMode()}>
                        {darkMode ? <span className="material-icons">light_mode</span> : <span className="material-icons">dark_mode</span>}
                    </button>
                    <div className="hamburger--menu">
                        <button
                            type="button"
                            className="button--unstyled hamburger--menu__icon"
                            onClick={() => setIsMenuExpanded((isMenuExpanded) => !isMenuExpanded)}
                        >
                            {isMenuExpanded ? <span className="material-icons">close</span> : <span className="material-icons"> menu</span>}
                        </button>
                        <div
                            className={classNames("menu--expanded", {
                                opened: isMenuExpanded,
                            })}
                        >
                            <ul>
                                {pages &&
                                    pages.length > 0 &&
                                    pages.map(
                                        (page) =>
                                            !routeIsDropdown(page) && (
                                                <Link key={page.url} to={page.url} onClick={resetExpandedDropdowns}>
                                                    <li className="menu--expanded__item" key={page.url}>
                                                        <span
                                                            className={classNames({ "active-item": page.url === window.location.pathname })}
                                                        >
                                                            {page.label}
                                                        </span>
                                                    </li>
                                                </Link>
                                            ),
                                    )}
                                <li
                                    className={classNames("menu--expanded__item", {
                                        opened: isEvmDropdownExpanded,
                                    })}
                                    onClick={closeDropdowns}
                                >
                                    <div className="label">{EVM_EXPLORER_DROPDOWN.label}</div>
                                    <div className="icon">
                                        <span className="material-icons">expand_more</span>
                                    </div>
                                </li>
                                {/* ----- EVM DROPDOWN MOBILE ----- */}
                                <div
                                    className={classNames("utilities--mobile", {
                                        opened: isEvmDropdownExpanded,
                                    })}
                                >
                                    {EVM_EXPLORER_DROPDOWN.routes.map((route) => (
                                        <Link key={route.url} to={route.url} onClick={resetExpandedDropdowns}>
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
                        isExpanded={isNetworkSwitcherExpanded}
                        onClick={toggleNetworkSwitcher}
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
