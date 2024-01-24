import React, { ReactNode } from "react";
import { FooterProps } from "./FooterProps";
import { FooterState } from "./FooterState";
import DiscordIcon from "~assets/discord.svg?react";
import GithubIcon from "~assets/github.svg?react";
import Logo from "~assets/shimmer-footer-bg.svg?react";
import TwitterIcon from "~assets/twitter.svg?react";
import { FoundationDataHelper } from "~helpers/foundationDataHelper";
import AsyncComponent from "../AsyncComponent";
import ExplorerVersion from "./ExplorerVersion";
import "./ShimmerFooter.scss";

/**
 * Component which will show the footer.
 */
class ShimmerFooter extends AsyncComponent<FooterProps, FooterState> {
    private readonly SOCIAL_LINKS = [
        {
            name: "Twitter",
            icon: <TwitterIcon />,
            url: "https://twitter.com/iota",
        },
        {
            name: "Discord",
            icon: <DiscordIcon />,
            url: "https://discord.iota.org/",
        },
        {
            name: "GitHub",
            icon: <GithubIcon />,
            url: "https://github.com/iotaledger/",
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
        this.setState({ foundationData });
    }

    /**
     * The component updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: FooterProps): void {
        if (this.props.dynamic !== prevProps.dynamic) {
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
                <section className="shimmer-footer--content">
                    <div className="arcs">
                        <Logo />
                    </div>
                    <div className="shimmer-inner">
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
                            <section className="social--media__wrapper">
                                {this.SOCIAL_LINKS.map((social, socialID) => (
                                    <a
                                        href={social.url}
                                        key={socialID}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social--media__item"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </section>
                        </div>
                        <hr className="sep" />
                        <div className="row foundation-data">
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
                    <ExplorerVersion shimmerTheme />
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

export default ShimmerFooter;
