import React, { Component, ReactNode } from "react";
import ChartistGraph from "react-chartist";
import "./LineChart.scss";
import { LineChartProps } from "./LineChartProps";

/**
 * Component which will display a line chart.
 */
class LineChart extends Component<LineChartProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const data = {
            series: [this.props.values]
        };

        const options = {
            fullWidth: true,
            showArea: true,
            low: 0,
            showPoint: false,
            chartPadding: 0,
            axisX: {
                showGrid: false,
                showLabel: false,
                offset: 0
            },
            axisY: {
                showGrid: false,
                showLabel: false,
                offset: 0
            }
        };

        return (
            <React.Fragment>
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="gradient-a" gradientTransform="rotate(90)">
                            <stop offset="0%" stopColor="#20F381" stopOpacity="1" />
                            <stop offset="100%" stopColor="#20F381" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="line-container">
                    <ChartistGraph data={data} options={options} type="Line" />
                </div>
            </React.Fragment>
        );
    }
}

export default LineChart;
