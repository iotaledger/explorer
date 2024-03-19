import { IStatDisplay } from "../lib/interfaces";
import { StatDisplaySize } from "../lib/enums";
import React from "react";
import "./StatDisplay.scss";

export default function StatDisplay({ title, subtitle, size = StatDisplaySize.Large }: IStatDisplay): React.JSX.Element {
    return (
        <div className="stat">
            <h3 className={`stat-title ${size}`}>{title}</h3>
            <p className="stat-subtitle">{subtitle}</p>
        </div>
    );
}
