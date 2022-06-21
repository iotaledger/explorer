import React, { Component, ReactNode } from "react";
import { FoundationDataHelper } from "../../../helpers/foundationDataHelper";
import { ReactComponent as DiscordIcon } from "./../../../assets/discord.svg";
import { ReactComponent as GithubIcon } from "./../../../assets/github.svg";
import { ReactComponent as SmrLogo } from "./../../../assets/smr-footer-bg.svg";
import { ReactComponent as TwitterIcon } from "./../../../assets/twitter.svg";
import "./SmrFooter.scss";
import { SmrFooterProps } from "./SmrFooterProps";
import { SmrFooterState } from "./SmrFooterState";

/**
 * Component which will show the footer.
 */
class SmrFooter extends Component<SmrFooterProps, SmrFooterState> {
    private readonly SOCIAL_LINKS = [
        {
            name: "Twitter",
            icon: <TwitterIcon />,
            url: "https://twitter.com/iota"
        },
        {
            name: "Discord",
            icon: <DiscordIcon />,
            url: "https://discord.iota.org/"
        },
        {
            name: "GitHub",
            icon: <GithubIcon />,
            url: "https://github.com/iotaledger/"
        }
    ];

    /**
     * Create a new instance of Footer.
     * @param props The props.
     */
    constructor(props: SmrFooterProps) {
        super(props);
        this.state = {
            siteFooterSection: this.buildSiteFooter()
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        this.setState({ foundationData: await FoundationDataHelper.loadData() });
    }

    /**
     * The component updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: SmrFooterProps): void {
        if (this.props.dynamic !== prevProps.dynamic) {
            this.setState({
                siteFooterSection: this.buildSiteFooter()
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <footer>
                <section className="smr-footer--content">
                    <div>
                        <SmrLogo />
                    </div>
                    <div className="smr-inner">
                        <div className="footer-grid">
                            {[this.state.siteFooterSection].concat(this.state.foundationData?.footerSections ?? [])
                                .map((section, sectionIdx) => (
                                    <section key={sectionIdx}>
                                        <h3>{section.label}</h3>
                                        <ul>
                                            {section.items.map((info, infoIdx) => (
                                                <li key={infoIdx}>
                                                    {FoundationDataHelper.buildLink(info.url, info.label)}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            <section className="social--media__wrapper">
                                {this.SOCIAL_LINKS.map((social, socialID) => (
                                    <a
                                        href={social.url}
                                        key={socialID}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ width: `${100 / this.SOCIAL_LINKS.length}%` }}
                                        className="social--media__item"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </section>
                        </div>
                        <hr className="sep" />
                        <div className="row foundation-data">
                            {/* <div >
                                <img src={logoFooter} alt="IOTA" />
                            </div> */}
                            <section className="line-breaks">
                                {this.state.foundationData?.registeredAddress.value.join("\n")}
                            </section>
                            <section>
                                <ul>
                                    {this.state.foundationData?.information.map((info, infoIdx) => (
                                        <li key={infoIdx}>
                                            {FoundationDataHelper.createValue(info)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>

                </section>
            </footer>
        );
    }

    /**
     * Build the footer.
     * @returns The footer data.
     */
    private buildSiteFooter(): {
        /**
         * The label for the section.
         */
        label: string;

        /**
         * The items to display in the section.
         */
        items: {
            /**
             * The label for the data.
             */
            label: string;

            /**
             * The url for the data.
             */
            url: string;
        }[];
    } {
        return {
            label: "Explorer",
            items: this.props.dynamic.map(n => ({
                label: n.label,
                url: `local://${n.url}`
            }))
        };
    }
}

export default SmrFooter;
