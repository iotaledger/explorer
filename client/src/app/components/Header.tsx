import React, { Component, ReactNode } from "react";
import logoHeader from "../../assets/logo-header.svg";
import "./Header.scss";

/**
 * Component which will will show the header.
 */
class Header extends Component<any, any> {
    /**
     * Create a new instance of Header.
     * @param props The props.
     */
    constructor(props: any) {
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
                        <img src={logoHeader} alt="Explorer" />
                    </section>
                    {this.props.children}
                </div>
            </header>
        );
    }
}

export default Header;
