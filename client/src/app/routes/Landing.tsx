import React, { Component, ReactNode } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IClientNetworkConfiguration } from "../../models/config/IClientNetworkConfiguration";
import "./Landing.scss";
import { LandingProps } from "./LandingProps";
import { LandingState } from "./LandingState";

/**
 * Component which will will show the landing page.
 */
class Landing extends Component<LandingProps, LandingState> {
    /**
     * Networks.
     */
    private readonly _networks: IClientNetworkConfiguration[];

    /**
     * Create a new instance of Explore.
     * @param props The props.
     */
    constructor(props: LandingProps) {
        super(props);

        this._networks = ServiceFactory.get<IClientNetworkConfiguration[]>("network-config");

        this.state = {
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="landing">
                <div className="wrapper header-wrapper">
                    <div className="inner">
                        <div className="header">
                            <h2>Searching</h2>
                            <div className="row space-between wrap">
                                <h1>{this.props.networkConfig.label}</h1>
                                {this.props.switcher}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wrapper">
                    <div className="inner">
                        <div className="feeds">
                            Feeds
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Landing;
