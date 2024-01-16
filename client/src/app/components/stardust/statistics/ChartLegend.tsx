import React from "react";
import "./ChartLegend.scss";

interface ChartLegendProps {
    readonly labels: string[];
    readonly colors: string[];
}

const ChartLegend: React.FC<ChartLegendProps> = ({ labels, colors }) => (
    <div className="chart-legend">
        {labels.map((label, idx) => {
            const thisColor = colors[idx];

            return (
                <div key={`entry-${idx}`} className="chart-legend__entry">
                    <div className="chart-legend__circle" style={{ backgroundColor: thisColor }} />
                    <span className="chart-legend__label">{label}</span>
                </div>
            );
        })}
    </div>
);

export default ChartLegend;
