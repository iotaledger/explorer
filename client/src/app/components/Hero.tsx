import React from "react";
import { IStatDisplay } from "../lib/interfaces";
import StatDisplay from "./StatDisplay";
import { HERO_BACKGROUNDS } from "../lib/constants/backgrounds.constants";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import "./Hero.scss";

const MAX_STATS_COLUMNS = 4;

interface IHero {
    network: string;
    subtitle?: string;
    overline?: string;
    stats?: IStatDisplay[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export default function Hero({ network, subtitle, overline, stats }: IHero): React.JSX.Element {
    const theme = useGetThemeMode();

    const statsColumnns: number | null = getStatColumns();
    const backgroundImage = HERO_BACKGROUNDS[theme];

    function getStatColumns(): number | null {
        let columns: number | null = null;

        if (stats && stats.length > 0) {
            columns = Math.round(stats.length / 2);
            columns = clamp(columns, 1, MAX_STATS_COLUMNS);
        }

        return columns;
    }

    return (
        <div id="hero">
            <div className="bg-container">
                <img src={backgroundImage} className="bg-image" alt="background" />
            </div>
            <div className="wrapper">
                <div className="inner">
                    <div className="title-cont">
                        {overline && <span className="overline">{overline}</span>}
                        <h2 className="title">{network}</h2>
                        {subtitle && <span className="subtitle">{subtitle}</span>}
                    </div>
                    <div className="stats-wrapper" data-columns={statsColumnns}>
                        {stats && stats.length > 0 && stats.map((stat, index) => <StatDisplay key={index} {...stat} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
