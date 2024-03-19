import React from "react";
import { IStatDisplay } from "../lib/interfaces";
import StatDisplay from "./StatDisplay";
import { HERO_BACKGROUNDS } from "../lib/constants/backgrounds.constants";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import "./Hero.scss";

interface IHero {
    network: string;
    subtitle?: string;
    overline?: string;
    networkStats?: IStatDisplay[];
    assetStats?: IStatDisplay[];
}

export default function Hero({ network, subtitle, overline, networkStats, assetStats }: IHero): React.JSX.Element {
    const theme = useGetThemeMode();

    const backgroundImage = HERO_BACKGROUNDS[theme];
    return (
        <div id="hero">
            <div className="bg-container">
                <img src={backgroundImage} className="bg-image" alt="background" />
            </div>
            <div className="wrapper">
                <div className="inner">
                    <div className="title-cont-wrapper">
                        <div className="title-cont">
                            {overline && <span className="overline">{overline}</span>}
                            <h2 className="title">{network}</h2>
                            {subtitle && <span className="subtitle">{subtitle}</span>}
                        </div>
                        <div className="network-stats-wrapper">
                            {networkStats &&
                                networkStats.length > 0 &&
                                networkStats.map((stat, index) => <StatDisplay key={index} {...stat} />)}
                        </div>
                    </div>
                    <div className="asset-stats-wrapper">
                        {assetStats && assetStats.length > 0 && assetStats.map((stat, index) => <StatDisplay key={index} {...stat} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
