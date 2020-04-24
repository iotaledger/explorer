import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoHeader from "../../assets/logo-header.svg";
import "./Header.scss";
import { HeaderProps } from "./HeaderProps";

/**
 * Component which will will show the header.
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
                <div className="inner">
                    <section className="row">
                        <Link to={`/${this.props.networkConfig.network}`}>
                            <img src={logoHeader} alt="Explorer" />
                        </Link>
                    </section>
                    {this.props.children}
                </div>
            </header>
        );
    }
}

export default Header;
