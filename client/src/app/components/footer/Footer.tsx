import React, { ReactNode } from "react";
import { FooterProps } from "./FooterProps";
import { FooterState } from "./FooterState";
import DiscordIcon from "~assets/discord.svg?react";
import GithubIcon from "~assets/github.svg?react";
import InstagramIcon from "~assets/instagram.svg?react";
import LinkedinIcon from "~assets/linkedin.svg?react";
import LogoFooter from "~assets/logo-footer.svg?react";
import RedditIcon from "~assets/reddit.svg?react";
import TwitterIcon from "~assets/twitter.svg?react";
import YoutubeIcon from "~assets/youtube.svg?react";
import { FoundationDataHelper } from "~helpers/foundationDataHelper";
import AsyncComponent from "../AsyncComponent";
import ExplorerVersion from "./ExplorerVersion";
import "./Footer.scss";

/**
 * Component which will show the footer.
 */
class Footer extends AsyncComponent<FooterProps, FooterState> {
    private readonly SOCIAL_LINKS = [
        {
            name: "Youtube",
            icon: <YoutubeIcon />,
            url: "https://www.youtube.com/c/iotafoundation",
            color: "#131F37",
        },
        {
            name: "GitHub",
            icon: <GithubIcon />,
            url: "https://github.com/iotaledger/",
            color: "#2C3850",
        },
        {
            name: "Discord",
            icon: <DiscordIcon />,
            url: "https://discord.iota.org/",
            color: "#4B576F",
        },
        {
            name: "Twitter",
            icon: <TwitterIcon />,
            url: "https://twitter.com/iota",
            color: "#6A768E",
        },
        {
            name: "Reddit",
            icon: <RedditIcon />,
            url: "https://www.reddit.com/r/Iota/",
            color: "#7D89A1",
        },
        {
            name: "LinkedIn",
            icon: <LinkedinIcon />,
            url: "https://www.linkedin.com/company/iotafoundation/",
            color: "#8995AD",
        },
        {
            name: "Instagram",
            icon: <InstagramIcon />,
            url: "https://www.instagram.com/iotafoundation/",
            color: "#99A5BD",
        },
    ];

    /**
     * Create a new instance of Footer.
     * @param props The props.
     */
    constructor(props: FooterProps) {
        super(props);
        this.state = {
            siteFooterSection: this.buildSiteFooter(),
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        const foundationData = await FoundationDataHelper.loadData();
        if (this._isMounted) {
            this.setState({ foundationData });
        }
    }

    /**
     * The component updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: FooterProps): void {
        if (this.props.dynamic !== prevProps.dynamic && this._isMounted) {
            this.setState({
                siteFooterSection: this.buildSiteFooter(),
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
                            {[this.state.siteFooterSection]
                                .concat(this.state.foundationData?.footerSections ?? [])
                                .map((section, sectionIdx) => (
                                    <section key={sectionIdx}>
                                        <h3>{section.label}</h3>
                                        <ul>
                                            {section.items.map((info, infoIdx) => (
                                                <li key={infoIdx}>{FoundationDataHelper.buildLink(info.url, info.label)}</li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                        </div>
                        <hr className="sep" />
                        <div className="row foundation-data">
                            <div className="margin-t-m">
                                <LogoFooter id="logo-footer" title="IOTA Foundation" />
                            </div>
                            <section className="line-breaks">{this.state.foundationData?.registeredAddress.value.join("\n")}</section>
                            <section>
                                <ul>
                                    {this.state.foundationData?.information.map((info, infoIdx) => (
                                        <li key={infoIdx}>{FoundationDataHelper.createValue(info)}</li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </section>
                <ExplorerVersion />
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
            items: this.props.dynamic.map((n) => ({
                label: n.label,
                url: `local://${n.url}`,
            })),
        };
    }
}

export default Footer;
