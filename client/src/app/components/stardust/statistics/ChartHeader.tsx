import React from "react";
import "./ChartHeader.scss";
import ChartLegend from "./ChartLegend";

interface ChartHeaderProps {
    title?: string;
    onTimespanSelected?: (value: TimespanOption) => void;
    legend?: {
        labels: string[];
        colors: string[];
    };
}

export type TimespanOption = "7" | "30" | "90" | "all";

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, onTimespanSelected, legend }) =>
    (
        <div className="chart-header">
            {title && (
                <div className="chart-header__title">
                    <h2>{title}</h2>
                </div>
            )}

            {onTimespanSelected && (
                <div className="chart-header__select">
                    <div className="select-container">
                        <select
                            className="period-select"
                            defaultValue="none"
                            onChange={({ target: { value } }) => {
                                if (onTimespanSelected) {
                                    onTimespanSelected(value as TimespanOption);
                                }
                            }}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last month</option>
                            <option value="90">Last six months</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </div>
            )}

            {legend && (
                <ChartLegend
                    labels={legend.labels}
                    colors={legend.colors}
                />
            )}
        </div>
    );

ChartHeader.defaultProps = {
    legend: undefined,
    onTimespanSelected: undefined,
    title: undefined
};

export default ChartHeader;
