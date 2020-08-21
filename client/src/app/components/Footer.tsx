import React, { Component, ReactNode } from "react";
import logoFooter from "../../assets/logo-footer.svg";
import { FoundationDataHelper } from "../../helpers/foundationDataHelper";
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
                <div className="inner">
                    <div className="row center">
                        <img src={logoFooter} alt="IOTA" />
                    </div>
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
