import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import close from "../../assets/close.svg";
import logoHeader from "../../assets/logo-header.svg";
import menuIcon from "../../assets/menu.svg";
import "./Header.scss";
import HeaderDropdown from "./HeaderDropdown";
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
                    <Link to={this.props.rootPath}>
                        <img className="logo-image" src={logoHeader} alt="Explorer" />
                    </Link>
                    {this.props.pages && this.props.pages.length > 0 && this.props.pages.map(page => (
                        <Link
                            key={page.url}
                            to={page.url}
                        >
                            <span className="page margin-l-s">{page.label}</span>
                        </Link>
                    ))}

                    <HeaderDropdown
                        label="Utilities"
                        columns={[
                            {
                                label: "Utilities",
                                items: [
                                    {
                                        label: "Explorer",
                                        url: "a"
                                    },
                                    {
                                        label: "Visualizer",
                                        url: "b"
                                    }
                                ]
                            }
                        ]}
                    />
                    {/* <HeaderDropdown
                        label="Utilities"
                        columns={[
                            {
                                label: "Utilities",
                                items: [
                                    {
                                        label: "Explorer",
                                        url: "a"
                                    },
                                    {
                                        label: "Visualizer",
                                        url: "b"
                                    }
                                ]
                            }
                        ]}
                    /> */}
                    {this.props.search}
                    <div className="network-switcher">
                        {this.props.switcher}
                    </div>
                    {/* {this.props.utilities && this.props.utilities.length > 0 && (
                        <div className="tools tools--small">
                            <button
                                type="button"
                                onClick={() => this.setState({ isExpanded: true })}
                            >
                                <img src={menuIcon} alt="Tools" />
                            </button>
                        </div>
                    )} */}
                </nav>
                {this.props.utilities && this.props.utilities.length > 0 && (
                    <React.Fragment>
                        <button
                            className="tools tools--large"
                            type="button"
                            onClick={() => this.setState({ isExpanded: true })}
                        >
                            <span className="margin-r-m">Tools</span>
                            <img src={menuIcon} alt="Tools" />
                        </button>
                        {this.state.isExpanded && (
                            <React.Fragment>
                                <div
                                    className={classNames(
                                        "tools-panel-shield", { "tools-panel-shield__active": this.state.isExpanded }
                                    )}
                                    onClick={() => this.setState({ isExpanded: false })}
                                />
                                <div
                                    className={classNames(
                                        "tools-panel", { "tools-panel__active": this.state.isExpanded }
                                    )}
                                >
                                    <div className="tools-panel-inner">
                                        <div className="tools-panel-close-container">
                                            <button
                                                type="button"
                                                onClick={() => this.setState({ isExpanded: false })}
                                                className="button-close"
                                            >
                                                <img src={close} alt="Close" />
                                            </button>
                                        </div>
                                        <div className="tools-panel-links">
                                            {this.props.utilities.map(utility => (
                                                <Link
                                                    key={utility.url}
                                                    to={utility.url}
                                                    onClick={() => this.setState({ isExpanded: false })}
                                                >
                                                    <span className="margin-l-s">{utility.label}</span>
                                                </Link>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
            </header>
        );
    }
}

export default Header;
