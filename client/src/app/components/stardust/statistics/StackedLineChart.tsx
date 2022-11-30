import { area, scaleLinear, scaleOrdinal, scaleTime, SeriesPoint, stack } from "d3";
import { axisBottom, axisLeft } from "d3-axis";
import { select } from "d3-selection";
import moment from "moment";
import React, { useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "./ChartHeader";
import "./StackedLineChart.scss";

interface StackedLineChartProps {
    title?: string;
    width: number;
    height: number;
    subgroups: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({
    title,
    height,
    width,
    subgroups,
    colors,
    data
}) => {
    const theSvg = useRef<SVGSVGElement>(null);
    const [timespan, setTimespan] = useState<TimespanOption>("7");

    useLayoutEffect(() => {
        const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 };
        const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
        const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;
        // reset
        select(theSvg.current).select("*").remove();

        const color = scaleOrdinal<string>().domain(subgroups).range(colors);

        data = timespan !== "all" ? data.slice(-timespan) : data;

        const stackedData = stack()
            .keys(subgroups)(data);

        const groups = data.map(
                        d => moment.unix(d.time)
                            .hours(0)
                            .minutes(0)
                            .toDate()
                    );
        const svg = select(theSvg.current)
            .attr("width", INNER_WIDTH + MARGIN.left + MARGIN.right)
            .attr("height", INNER_HEIGHT + MARGIN.top + MARGIN.bottom)
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const x = scaleTime()
                .domain([groups[0], groups[groups.length - 1]])
                .range([0, INNER_WIDTH]);

        const computeYMax = (entries: { [name: string]: number; time: number }[]) => Math.max(
            ...entries.map(d => {
                let sum = 0;
                for (const key of subgroups) {
                    sum += d[key];
                }
                return sum;
            })
        );

        const y = scaleLinear().domain([0, computeYMax(data)])
            .range([INNER_HEIGHT, 0]);

        const yAxisGrid = axisLeft(y.nice())
            .ticks(5)
            .tickSize(-INNER_WIDTH)
            .tickPadding(8);

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(yAxisGrid);

        let tickValues;
        switch (timespan) {
            case "7":
                tickValues = 7;
                break;
            default:
                tickValues = Math.floor(data.length / 4);
                break;
        }

        const xAxis = axisBottom(x)
                    .ticks(tickValues);

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0, ${INNER_HEIGHT})`)
            .call(xAxis);

        const areaGen = area<SeriesPoint<{ [key: string]: number }>>()
            .x(d => x(moment.unix(d.data.time)
                            .hours(0)
                            .minutes(0)
                            .toDate()) ??
                    0
            )
            .y0(d => y(d[0]))
            .y1(d => y(d[1]));

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("path")
            .style("fill", d => color(d.key))
            .attr("d", areaGen);
    }, [width, height, data, timespan]);

    return (
        <div className="line-chart--wrapper">
            <ChartHeader
                title={title}
                onTimespanSelected={value => setTimespan(value)}
                legend={{
                    labels: subgroups,
                    colors
                }}
            />
            <svg className="hook" ref={theSvg} />
        </div>
    );
};

StackedLineChart.defaultProps = {
    title: undefined
};

export default StackedLineChart;
