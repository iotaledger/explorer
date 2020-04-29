import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoFooter from "../../assets/logo-footer.svg";
import "./Footer.scss";
import { FooterProps } from "./FooterProps";
import { FooterState } from "./FooterState";

/**
 * Component which will show the footer.
 */
class Footer extends Component<FooterProps, FooterState> {
    /**
     * Create a new instance of Footer.
     * @param props The props.
     */
    constructor(props: FooterProps) {
        super(props);
        this.state = {
            siteFooterSection: {
                label: "Explorer",
                items: this.props.networks.map(n => ({
                    label: n.label,
                    url: `local://${n.url}`
                }))
            }
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        try {
            const response = await fetch("https://webassets.iota.org/data/foundation.json");
            const foundation = await response.json();

            this.setState({ foundation });
        } catch { }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <footer>
                <div className="inner">
                    <div className="row center">
                        <img src={logoFooter} alt="IOTA" />
                    </div>
                    <div className="row">
                        {[this.state.siteFooterSection].concat(this.state.foundation?.footerSections || [])
                            .map((section, sectionIdx) => (
                                <section className="col fill" key={sectionIdx}>
                                    <h3>{section.label}</h3>
                                    <ul>
                                        {section.items.map((info, infoIdx) => (
                                            <li key={infoIdx}>
                                                {this.createValue(info)}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                    </div>
                    <hr className="sep" />
                    <div className="row secondary">
                        <section className="col fill line-breaks">
                            {this.state.foundation?.registeredAddress.value.join("\n")}
                        </section>
                        <section className="col fill">
                            <ul>
                                {this.state.foundation?.information.map((info, infoIdx) => (
                                    <li key={infoIdx}>
                                        {this.createValue(info)}
                                    </li>
                                ))}

                            </ul>
                        </section>
                    </div>
                </div>
            </footer>
        );
    }

    /**
     * Create the display for a value.
     * @param info The information to display.
     * @returns The element to display.
     */
    private createValue(
        info: {
            /**
             * The label for the data.
             */
            label: string;

            /**
             * The value for the data.
             */
            value?: string | string[];

            /**
             * The url for the data.
             */
            url?: string;
        }): React.ReactNode {

        // tslint:disable: react-no-dangerous-html
        if (!info.value) {
            if (info.url) {
                return this.buildLink(info.url, info.label);
            } else {
                return (
                    <span
                        dangerouslySetInnerHTML={
                            { __html: this.buildLines(info.label) }
                        }
                    />
                );
            }
        }

        if (info.url) {
            return (
                <React.Fragment>
                    <span>{info.label}: </span>
                    {this.buildLink(info.url, info.value)}
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <span>{info.label}: </span>
                    <span
                        dangerouslySetInnerHTML={
                            { __html: this.buildLines(info.value) }
                        }
                    />
                </React.Fragment>
            );
        }
    }

    /**
     * Build lines to display.
     * @param content The content to display.
     * @returns The element to display.
     */
    private buildLines(content: string | string[]): string {
        if (Array.isArray(content)) {
            return `<span className="line-breaks">${content.join("\n")}</span>`;
        }

        return content;
    }

    /**
     * Build link as either local or external.
     * @param url The url to create.
     * @param value The label for the link.
     * @returns The created link element.
     */
    private buildLink(url: string, value: string | string[]): React.ReactNode {
        if (url.startsWith("http") || url.startsWith("mailto")) {
            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    dangerouslySetInnerHTML={
                        { __html: this.buildLines(value) }
                    }
                />
            );
        }

        return (
            <Link
                to={url.replace("local:/", "")}
                dangerouslySetInnerHTML={
                    { __html: this.buildLines(value) }
                }
            />
        );
    }
}

export default Footer;
