import React from "react";
import { IGroupRoute } from "./Header";
import classNames from "classnames";
import { Link } from "react-router-dom";

export default function GroupDropdown({ label, routes, isExpanded, setExpandedDropdownId }: IGroupRoute): React.JSX.Element {
    function toggleOpen(): void {
        setExpandedDropdownId(isExpanded ? undefined : label);
    }

    function closeDropdown(e: React.MouseEvent): void {
        setExpandedDropdownId();
    }

    return (
        <div className="utilities--wrapper">
            <div
                className={classNames("utilities--dropdown", {
                    opened: isExpanded,
                })}
                onClick={toggleOpen}
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
                <div className="utilities">
                    <div className="utilities--label">{label}</div>
                    {routes.map((route) => (
                        <div key={route.url} className="utilities--item">
                            <Link
                                to={route.url}
                                onClick={closeDropdown}
                                className={classNames({ "active-item": route.url === window.location.pathname })}
                            >
                                {route.label}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            {isExpanded && <div className="header--expanded--shield" onClick={closeDropdown} />}
        </div>
    );
}
