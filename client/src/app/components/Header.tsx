import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoHeader from "../../assets/logo-header.svg";
import "./Header.scss";
import { HeaderProps } from "./HeaderProps";

/**
 * Component which will show the header.
 */
class Header extends Component<HeaderProps, any> {
    /**
     * Create a new instance of Header.
     * @param props The props.
     */
    constructor(props: HeaderProps) {
        super(props);

        this.state = {
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
                    <Link to={`/${this.props.networkConfig.network}`}>
                        <img src={logoHeader} alt="Explorer" />
                    </Link>
                    {this.props.search}
                    {this.props.switcher}
                </nav>
            </header>
        );
    }
}

export default Header;
