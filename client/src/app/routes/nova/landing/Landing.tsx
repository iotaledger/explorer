import React from "react";
import { RouteComponentProps } from "react-router-dom";
import LandingEpochSection from "~/app/components/nova/landing/LandingEpochSection";
import LandingSlotSection from "~/app/components/nova/landing/LandingSlotSection";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { LandingRouteProps } from "../../LandingRouteProps";
import "./Landing.scss";

const Landing: React.FC<RouteComponentProps<LandingRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);

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
                    <LandingSlotSection />
                </div>
            </div>
        </div>
    );
};

export default Landing;
