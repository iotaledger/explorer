import React, { Component, ReactNode } from "react";
import Cookies from "universal-cookie";
import "./Disclaimer.scss";
import { DisclaimerState } from "./DisclaimerState";

/**
 * Show the cookie disclaimer component.
 */
class Disclaimer extends Component<unknown, DisclaimerState> {
    /**
     * Create a new instance of the Disclaimer.
     * @param props The properties.
     */
    constructor(props: unknown) {
        super(props);

        this.state = {
            ackCookies: true
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        const cookies = new Cookies();
        const cookieAck = cookies.get("cookieAck");
        this.setState({ ackCookies: cookieAck === "yes" });

        // If the cookie was already acknowledged extend its lifespan
        if (cookieAck === "yes") {
            cookies.set("cookieAck", "yes", { maxAge: 31536000, path: "/" });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return this.state.ackCookies ? null : (
            <div className="disclaimer">
                <span className="margin-r-s">
                    <span className="margin-r-s">This website uses cookies to ensure you get the best experience.</span>
                    <a
                        href="https://www.iota.org/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more.
                    </a>
                </span>
                <button
                    onClick={() => this.dismiss()}
                    className="button"
                    type="button"
                >
                    Dismiss
                </button>
            </div>
        );
    }

    /**
     * Dismiss the disclaimer.
     */
    private dismiss(): void {
        const cookies = new Cookies();
        cookies.set("cookieAck", "yes", { maxAge: 31536000, path: "/" });
        this.setState({ ackCookies: true });
    }
}

export default Disclaimer;
