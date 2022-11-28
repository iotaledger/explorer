import React from "react";
import "./ChartSelect.scss";

interface ChartSelectProps {
    onTimespanSelected: (value: TimespanOption) => void;
}

type TimespanOption = "7days" | "one" | "six" | "year";

const ChartLegend: React.FC<ChartSelectProps> = ({ onTimespanSelected }) =>
    (
        <div className="chart-select">
            <div className="select-container">
                <select
                    className="period-select"
                    defaultValue="none"
                    onChange={({ target: { value } }) => onTimespanSelected(value as TimespanOption)}
                >
                    <option value="7days">Last 7 days</option>
                    <option value="one">Last month</option>
                    <option value="six">Last six months</option>
                    <option value="year">Last year</option>
                </select>
            </div>
        </div>
    );

export default ChartLegend;
