import React from "react";
// import { Comm } from '@iota/sdk-wasm-nova/web';
import { RouteComponentProps } from "react-router-dom";
import LandingEpochSection from "~/app/components/nova/landing/LandingEpochSection";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { LandingRouteProps } from "../../LandingRouteProps";
import "./Landing.scss";
import { ServiceFactory } from "~factories/serviceFactory";
import { NovaFeedClient } from "~services/nova/novaFeedClient";

const Landing: React.FC<RouteComponentProps<LandingRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);

    React.useEffect(() => {
        const feedService = ServiceFactory.get<NovaFeedClient>(`feed-${network}`);
        console.log('--- feedService', feedService);
    }, []);

    return (
        <div className="landing-nova">
            <div className="header-wrapper">
                <div className="inner">
                    <div className="header">
                        <div className="header--title">
                            <h2>{networkConfig.isEnabled ? "Explore network" : ""}</h2>
                            <div className="network-name">
                                <h1>{networkConfig.label}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="wrapper">
                <div className="inner">
                    <LandingEpochSection />
                </div>
            </div>
        </div>
    );
};

export default Landing;
