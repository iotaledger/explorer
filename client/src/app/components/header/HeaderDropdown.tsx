import React from "react";
import { IDropdownRoute } from "~/app/lib/interfaces";
import classNames from "classnames";
import NavigationRouteHelper from "./NavigationRouteHelper";

interface INavigationDropdown extends IDropdownRoute {
    isExpanded: boolean;
    setExpandedDropdownId: (label?: string) => void;
    setIsMenuExpanded?: (isExpanded: boolean) => void;
}

interface IDropdownProps extends INavigationDropdown {
    toggleDropdown: () => void;
}

/**
 * Dropdown component for header.
 */
export default function HeaderDropdown(props: INavigationDropdown & { mobileOnly?: boolean }): React.JSX.Element {
    const { isExpanded, setExpandedDropdownId, mobileOnly, label } = props;
    const DropdownComponent = mobileOnly ? MobileDropdown : DesktopDropdown;

    const toggleDropdown = (): void => setExpandedDropdownId(isExpanded ? undefined : label);

    return <DropdownComponent {...props} toggleDropdown={toggleDropdown} />;
}

/**
 * Dropdown component for desktop.
 */
const DesktopDropdown = ({
    label,
    disabled,
    routes,
    isExpanded,
    toggleDropdown,
    setExpandedDropdownId,
}: IDropdownProps): React.JSX.Element => {
    const closeDropdown = (e?: React.MouseEvent): void => setExpandedDropdownId();

    return (
        <>
            {!disabled && (
                <div className="header-dropdown--wrapper">
                    <div
                        className={classNames("header-dropdown--dropdown", {
                            opened: isExpanded,
                        })}
                        onClick={toggleDropdown}
                    >
                        <div className="label">{label}</div>
                        <div className="icon">
                            <span className="material-icons">expand_more</span>
                        </div>
                    </div>

                    <div
                        className={classNames("header--expanded", {
                            opened: isExpanded,
                        })}
                    >
                        <div className="header-dropdown">
                            <div className="header-dropdown--label">{label}</div>
                            {routes
                                .filter(({ disabled }) => !disabled)
                                .map((route) => (
                                    <div key={route.url} className="header-dropdown--item">
                                        <NavigationRouteHelper
                                            onClick={closeDropdown}
                                            className={classNames({ "active-item": route.url === window.location.pathname })}
                                            route={route}
                                        >
                                            {route.label}
                                        </NavigationRouteHelper>
                                    </div>
                                ))}
                        </div>
                    </div>
                    {isExpanded && <div className="header--expanded--shield" onClick={closeDropdown} />}
                </div>
            )}
        </>
    );
};

/**
 * Dropdown component for mobile.
 */
const MobileDropdown = ({
    label,
    disabled,
    routes,
    isExpanded,
    toggleDropdown,
    setExpandedDropdownId,
    setIsMenuExpanded,
}: IDropdownProps): React.JSX.Element => {
    function handleRouteClick(e?: React.MouseEvent): void {
        setExpandedDropdownId();
        setIsMenuExpanded?.(false);
    }

    return (
        <>
            {disabled && (
                <>
                    <li
                        className={classNames("menu--expanded__item", {
                            opened: isExpanded,
                        })}
                        onClick={toggleDropdown}
                    >
                        <div className="label">{label}</div>
                        <div className="icon">
                            <span className="material-icons">expand_more</span>
                        </div>
                    </li>
                    <div
                        className={classNames("header-dropdown--mobile", {
                            opened: isExpanded,
                        })}
                    >
                        {routes
                            .filter(({ disabled }) => !disabled)
                            .map((route) => (
                                <NavigationRouteHelper key={route.url} route={route} onClick={handleRouteClick}>
                                    <li
                                        key={route.url}
                                        className={classNames("menu--expanded__item margin-l-t", {
                                            "active-item": route.url === window.location.pathname,
                                        })}
                                    >
                                        {route.label}
                                    </li>
                                </NavigationRouteHelper>
                            ))}
                    </div>
                </>
            )}
        </>
    );
};
