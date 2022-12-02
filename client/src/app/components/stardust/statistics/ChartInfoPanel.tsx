import React from "react";

interface ChartTooltipProps {
    label: string;
    value: string | number;
}

const ChartInfoPanel: React.FC<ChartTooltipProps> = ({ label, value }) =>
    (
        <div className="card">
            <div className="card--content">
                <div className="card--label margin-b-t">
                    {label}
                </div>
                <div className="card--value margin-b-0">
                    <h2>{value}</h2>
                </div>
            </div>
        </div>
    );

export default ChartInfoPanel;

