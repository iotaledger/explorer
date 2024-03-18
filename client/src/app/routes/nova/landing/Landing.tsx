import React from "react";
import { RouteComponentProps } from "react-router-dom";
import LandingEpochSection from "~/app/components/nova/landing/LandingEpochSection";
import LandingSlotSection from "~/app/components/nova/landing/LandingSlotSection";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { LandingRouteProps } from "../../LandingRouteProps";
import Hero from "~/app/components/Hero";
import { IStatDisplay } from "~/app/lib/interfaces";
import { StatDisplaySize } from "~/app/lib/enums";
import IconContent from "~/app/components/IconContent";
import VolumeVelocity from "~/assets/volume_velocity_icon.svg?react";
import Parallelism from "~/assets/parallelism_icon.svg?react";
import "./Landing.scss";

const Landing: React.FC<RouteComponentProps<LandingRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);

    const stats: IStatDisplay[] = [
        {
            title: "72.8k",
            subtitle: "Validators",
        },
        {
            title: "52.1k",
            subtitle: "Delegators",
        },
        {
            title: "11.2k",
            subtitle: "Accounts",
        },
        {
            title: "39%",
            subtitle: "Total Staked",
            size: StatDisplaySize.Small,
        },
        {
            title: "39%",
            subtitle: "Total Delegated",
            size: StatDisplaySize.Small,
        },
    ];

    return (
        <div className="landing-nova">
            <Hero network={networkConfig.network} overline="Explore network" stats={stats} />
            <div className="wrapper">
                <div className="inner">
                    <div className="stats-grid">
                        <IconContent Icon={VolumeVelocity} title="11.8" subtitle="Blocks per sec" />
                        <IconContent Icon={Parallelism} title="55.93%" subtitle="Incursion rate" />
                    </div>
                    <LandingEpochSection />
                    <LandingSlotSection />
                </div>
            </div>
        </div>
    );
};

export default Landing;
