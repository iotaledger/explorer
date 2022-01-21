import React, { Component, ReactNode } from "react";
import logoFooter from "../../assets/logo-footer.svg";
import { FoundationDataHelper } from "../../helpers/foundationDataHelper";
import { ReactComponent as DiscordIcon } from "./../../assets/discord.svg";
import { ReactComponent as FacebookIcon } from "./../../assets/facebook.svg";
import { ReactComponent as GithubIcon } from "./../../assets/github.svg";
import { ReactComponent as InstagramIcon } from "./../../assets/instagram.svg";
import { ReactComponent as LinkedinIcon } from "./../../assets/linkedin.svg";
import { ReactComponent as RedditIcon } from "./../../assets/reddit.svg";
import { ReactComponent as TwitterIcon } from "./../../assets/twitter.svg";
import { ReactComponent as YoutubeIcon } from "./../../assets/youtube.svg";
import "./Footer.scss";
import { FooterProps } from "./FooterProps";
import { FooterState } from "./FooterState";

/**
 * Component which will show the footer.
 */
class Footer extends Component<FooterProps, FooterState> {
    private readonly SOCIAL_LINKS = [
        {
            name: "Youtube",
            icon: <YoutubeIcon />,
            url: "https://www.youtube.com/c/iotafoundation",
            color: "#131F37"
        },
        {
            name: "GitHub",
            icon: <GithubIcon />,
            url: "https://github.com/iotaledger/",
            color: "#2C3850"
        },
        {
            name: "Discord",
            icon: <DiscordIcon />,
            url: "https://discord.iota.org/",
            color: "#4B576F"
        },
        {
            name: "Twitter",
            icon: <TwitterIcon />,
            url: "https://twitter.com/iota",
            color: "#6A768E"
        },
        {
            name: "Reddit",
            icon: <RedditIcon />,
            url: "https://www.reddit.com/r/Iota/",
            color: "#7D89A1"
        },
        {
            name: "LinkedIn",
            icon: <LinkedinIcon />,
            url: "https://www.linkedin.com/company/iotafoundation/",
            color: "#8995AD"
        },
        {
            name: "Instagram",
            icon: <InstagramIcon />,
            url: "https://www.instagram.com/iotafoundation/",
            color: "#99A5BD"
        }, {
            name: "Facebook",
            icon: <FacebookIcon />,
            url: "https://www.facebook.com/iotafoundation/",
            color: "#BAC6DE"
        }
    ];

    /**
     * Create a new instance of Footer.
     * @param props The props.
     */
    constructor(props: FooterProps) {
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
    public componentDidUpdate(prevProps: FooterProps): void {
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
                <section className="footer--content">
                    <div className="inner">
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
                        </div>
                        <hr className="sep" />
                        <div className="row foundation-data">
                            <div className="margin-t-m">
                                <img src={logoFooter} alt="IOTA" />
                            </div>
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
                <section className="social--media__wrapper">
                    {this.SOCIAL_LINKS.map((social, socialID) => (
                        <a
                            href={social.url}
                            key={socialID}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: social.color, width: `${100 / this.SOCIAL_LINKS.length}%` }}
                            className="social--media__item"
                        >
                            {social.icon}
                            <span>{social.name}</span>
                        </a>
                    ))}
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

export default Footer;
