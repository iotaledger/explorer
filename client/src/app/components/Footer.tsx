import React, { Component, ReactNode } from "react";
import logoFooter from "../../assets/logo-footer.svg";
import { FoundationDataHelper } from "../../helpers/foundationDataHelper";
import { ReactComponent as DiscordIcon } from "./../../assets/discord.svg";
import { ReactComponent as GithubIcon } from "./../../assets/github.svg";
import { ReactComponent as InstagramIcon } from "./../../assets/instagram.svg";
import { ReactComponent as LinkedinIcon } from "./../../assets/linkedin.svg";
import { ReactComponent as RedditIcon } from "./../../assets/reddit.svg";
import { ReactComponent as TwitterIcon } from "./../../assets/twitter.svg";
import { ReactComponent as YoutubeIcon } from "./../../assets/youtube.svg";
import { ReactComponent as FacebookIcon } from "./../../assets/facebook.svg";
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
            color: "#131f36"
        },
        {
            name: "GitHub",
            icon: <GithubIcon />,
            url: "https://github.com/iotaledger/",
            color: "#3c4964"
        },
        {
            name: "Discord",
            icon: <DiscordIcon />,
            url: "https://discord.iota.org/",
            color: "#69768f"
        },
        {
            name: "Twitter",
            icon: <TwitterIcon />,
            url: "https://twitter.com/iota",
            color: "#8493ad"
        },
        {
            name: "Reddit",
            icon: <RedditIcon />,
            url: "https://www.reddit.com/r/Iota/",
            color: "#9fafca"
        },
        {
            name: "LinkedIn",
            icon: <LinkedinIcon />,
            url: "https://www.linkedin.com/company/iotafoundation/",
            color: "#c3d0e4"
        },
        {
            name: "Instagram",
            icon: <InstagramIcon />,
            url: " https://www.instagram.com/iotafoundation/",
            color: "#d1ddf0"
        }, {
            name: "Facebook",
            icon: <FacebookIcon />,
            url: " https://www.facebook.com/iotafoundation/",
            color: "#d1ddf0"
        },
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
                <div className="foundation--data">
                    <div className="inner">
                        <div className="row">
                            {[this.state.siteFooterSection].concat(this.state.foundationData?.footerSections ?? [])
                                .map((section, sectionIdx) => (
                                    <section className="col fill" key={sectionIdx}>
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
                        <div className="row secondary">
                            <div className="col fill margin-t-m">
                                <img src={logoFooter} alt="IOTA" />
                            </div>
                            <section className="col fill line-breaks">
                                {this.state.foundationData?.registeredAddress.value.join("\n")}
                            </section>
                            <section className="col fill">
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

                </div>
                <div className="social--media__wrapper">
                    {this.SOCIAL_LINKS.map((socialPage, socialPageID) => (
                        <a
                            href={socialPage.url}
                            key={socialPageID}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: socialPage.color }}
                            className="social--media__item"
                        >
                            {socialPage.icon}
                            <span>{socialPage.name}</span>
                        </a>
                    ))}
                </div>
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
