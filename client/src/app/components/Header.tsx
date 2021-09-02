import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoHeader from "../../assets/logo-header.svg";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import "./Header.scss";
import { HeaderProps } from "./HeaderProps";
import { HeaderState } from "./HeaderState";

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
            isExpanded: false
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
                        onClick={() => this.setState({ isExpanded: false })}
                    >
                        <img className="logo-image" src={logoHeader} alt="Explorer" />
                    </Link>
                    {this.props.pages && this.props.pages.length > 0 && this.props.pages.map(page => (
                        <Link
                            key={page.url}
                            to={page.url}
                            onClick={() => this.setState({ isExpanded: false })}
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
                            className={classNames("utilities--dropdown", { opened: this.state.isExpanded })}
                            onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
                        >
                            <div className="label">
                                Utilities
                            </div>
                            <div className="icon">
                                <DropdownIcon />
                            </div>
                        </div>
                        {this.state.isExpanded && (
                            <React.Fragment>
                                <div className="utilities--content">
                                    <div className="utilities">
                                        <div className="utilities--label">Utilities</div>
                                        {this.props.utilities?.map(utility => (
                                            <div
                                                key={utility.url}
                                                className="utilities--item"
                                            >
                                                <Link
                                                    to={utility.url}
                                                    onClick={() => this.setState({ isExpanded: false })}
                                                >
                                                    {utility.label}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    className="utilities--shield"
                                    onClick={() => this.setState({ isExpanded: false })}
                                />
                            </React.Fragment>
                        )}
                    </div>
                    {this.props.search}
                    <div className="network-switcher">
                        {this.props.switcher}
                    </div>
                </nav>
            </header >
        );
    }
}

export default Header;
