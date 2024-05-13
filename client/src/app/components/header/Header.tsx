import React, { useEffect, useState } from "react";
import * as H from "history";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Logo from "~assets/logo-header.svg?react";
import { IDropdownRoute, IRoute } from "~/app/lib/interfaces";
import mainChrysalisMessage from "~assets/modals/chrysalis/search/main-header.json";
import mainLegacyMessage from "~assets/modals/legacy/search/main-header.json";
import mainStardustMessage from "~assets/modals/stardust/search/main-header.json";
import mainNovaMessage from "~assets/modals/nova/search/main-header.json";
import ShimmerLogo from "~assets/shimmer-logo-header.svg?react";
import { ServiceFactory } from "~factories/serviceFactory";
import { isMarketedNetwork, isShimmerUiTheme } from "~helpers/networkHelper";
import { CHRYSALIS, LEGACY, NOVA, ProtocolVersion, STARDUST } from "~models/config/protocolVersion";
import { SettingsService } from "~services/settingsService";
import FiatSelector from "../FiatSelector";
import Modal from "../Modal";
import NetworkSwitcher from "../NetworkSwitcher";
import { INetwork } from "~/models/config/INetwork";
import SearchInput from "../SearchInput";
import HeaderDropdown from "./HeaderDropdown";
import "./Header.scss";

const NETWORK_DROPDOWN_LABEL = "Network Switcher";

const MODAL_MESSAGE: { [key in ProtocolVersion]?: { title: string; description: string } } = {
    [LEGACY]: mainLegacyMessage,
    [CHRYSALIS]: mainChrysalisMessage,
    [STARDUST]: mainStardustMessage,
    [NOVA]: mainNovaMessage,
};

interface IHeader {
    rootPath: string;
    currentNetwork?: INetwork;
    networks: INetwork[];
    history?: H.History;
    action?: string;
    protocolVersion: ProtocolVersion;
    pages?: (IRoute | IDropdownRoute)[];
}

export default function Header({ rootPath, currentNetwork, networks, history, action, protocolVersion, pages: routes }: IHeader) {
    const settingsService = ServiceFactory.get<SettingsService>("settings");

    const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
    const [darkMode, setDarkMode] = useState<boolean>(settingsService.get().darkMode ?? false);
    const [show, setShow] = useState<boolean>(false);
    const [expandedDropdownLabel, setExpandedDropdownLabel] = useState<string | undefined>();

    const isNetworkSwitcherExpanded = expandedDropdownLabel === NETWORK_DROPDOWN_LABEL;
    const isShimmerUi = isShimmerUiTheme(currentNetwork?.uiTheme);
    const isMarketed = isMarketedNetwork(currentNetwork?.network);
    const modalMessage = currentNetwork?.protocolVersion ? MODAL_MESSAGE[currentNetwork.protocolVersion] : undefined;

    useEffect(() => {
        saveThemeAndDispatchEvent(darkMode);
        toggleBodyThemeClass();
    }, [darkMode]);

    function saveThemeAndDispatchEvent(newDarkMode: boolean): void {
        settingsService.saveSingle("darkMode", newDarkMode);
        const event = new CustomEvent("theme-change", { detail: { darkMode: newDarkMode } });
        window.dispatchEvent(event);
    }

    /**
     * Toggle the display mode.
     */
    function handleThemeChange(): void {
        setDarkMode((darkMode) => {
            const newDarkMode = !darkMode;
            saveThemeAndDispatchEvent(darkMode);
            return newDarkMode;
        });

        toggleBodyThemeClass();
    }

    function toggleBodyThemeClass(): void {
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

    function routeIsDropdown(route: IRoute | IDropdownRoute): route is IDropdownRoute {
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
                        {routes &&
                            routes.length > 0 &&
                            routes
                                .filter((route) => !route.disabled)
                                .map((route) =>
                                    !routeIsDropdown(route) ? (
                                        <Link
                                            key={route.url}
                                            to={route.url}
                                            target={route.isExternal ? "_blank" : undefined}
                                            rel={route.isExternal ? "noopener noreferrer" : undefined}
                                            onClick={closeDropdowns}
                                            className={classNames("navigation--item", {
                                                "active-item": route.url === window.location.pathname,
                                            })}
                                        >
                                            {route.label}
                                        </Link>
                                    ) : (
                                        <HeaderDropdown
                                            key={route.label}
                                            {...route}
                                            isExpanded={expandedDropdownLabel === route.label}
                                            setExpandedDropdownId={setExpandedDropdownLabel}
                                        />
                                    ),
                                )}

                        {isMarketed && (
                            <div className="mobile-fiat">
                                <FiatSelector />
                            </div>
                        )}

                        <SearchInput
                            onSearch={(query) => history?.push(`/${currentNetwork?.network}/search/${query}`)}
                            protocolVersion={protocolVersion}
                        />

                        {modalMessage && <Modal icon="info" data={modalMessage} showModal={setShow} />}

                        {/* ----- Only visible in desktop ----- */}
                        {isMarketed && (
                            <div className="desktop-fiat">
                                <FiatSelector />
                            </div>
                        )}
                    </div>

                    {/* Theme Button */}
                    <button type="button" className="button--unstyled theme-toggle" onClick={() => handleThemeChange()}>
                        {darkMode ? <span className="material-icons">light_mode</span> : <span className="material-icons">dark_mode</span>}
                    </button>

                    {/* Hamburger Menu */}
                    <div className="hamburger--menu">
                        <button
                            type="button"
                            className="button--unstyled hamburger--menu__icon"
                            onClick={() => setIsMenuExpanded((isMenuExpanded) => !isMenuExpanded)}
                        >
                            {isMenuExpanded ? <span className="material-icons">close</span> : <span className="material-icons"> menu</span>}
                        </button>

                        {/* ----- Menu: Only visible in mobile ----- */}
                        <div
                            className={classNames("menu--expanded", {
                                opened: isMenuExpanded,
                            })}
                        >
                            <ul>
                                {routes &&
                                    routes.length > 0 &&
                                    routes
                                        .filter((route) => !route.disabled)
                                        .map((route) =>
                                            !routeIsDropdown(route) ? (
                                                <Link key={route.url} to={route.url} onClick={resetExpandedDropdowns}>
                                                    <li className="menu--expanded__item" key={route.url}>
                                                        <span
                                                            className={classNames({
                                                                "active-item": route.url === window.location.pathname,
                                                            })}
                                                        >
                                                            {route.label}
                                                        </span>
                                                    </li>
                                                </Link>
                                            ) : (
                                                <HeaderDropdown
                                                    key={route.label}
                                                    {...route}
                                                    isExpanded={route.label === expandedDropdownLabel}
                                                    setExpandedDropdownId={setExpandedDropdownLabel}
                                                    setIsMenuExpanded={setIsMenuExpanded}
                                                    mobileOnly
                                                />
                                            ),
                                        )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ----- Network Switcher ----- */}
                <div className="inner--networks">
                    <NetworkSwitcher
                        eyebrow="Network"
                        label={currentNetwork?.label}
                        networks={networks}
                        isExpanded={isNetworkSwitcherExpanded}
                        onClick={() => setExpandedDropdownLabel(isNetworkSwitcherExpanded ? undefined : NETWORK_DROPDOWN_LABEL)}
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
