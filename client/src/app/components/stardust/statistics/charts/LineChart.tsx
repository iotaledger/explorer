import classNames from "classnames";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { line } from "d3-shape";
import moment from "moment";
import React, { useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import { noDataView, useSingleValueTooltip } from "../ChartUtils";
import "./Chart.scss";

interface LineChartProps {
    title?: string;
    data: { [name: string]: number; time: number }[];
    label?: string;
    color: string;
}

const LineChart: React.FC<LineChartProps> = ({ title, data, label, color }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const theSvg = useRef<SVGSVGElement>(null);
    const theTooltip = useRef<HTMLDivElement>(null);
    const [timespan, setTimespan] = useState<TimespanOption>("30");
    const buildTooltip = useSingleValueTooltip(data, label);

    useLayoutEffect(() => {
        if (data.length > 0) {
            const width = chartRef.current?.clientWidth ?? 0;
            const height = chartRef.current?.clientHeight ?? 0;

            const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;
            // reset
            select(theSvg.current).select("*").remove();

            data = timespan !== "all" ? data.slice(-timespan) : data;

            const timestampToDate = (timestampInSec: number) => (
                moment.unix(timestampInSec)
                    .hours(0).minutes(0)
                    .toDate()
            );

            const domain = [
                data.length > 0 ? timestampToDate(data[0].time) : new Date(),
                data.length > 0 ? timestampToDate(data[data.length - 1].time) : new Date()
            ];

            const x = scaleTime().domain(domain).range([0, INNER_WIDTH])
                .nice();

            const dataMaxN = max(data, d => d.n) ?? 1;
            const y = scaleLinear().domain([0, dataMaxN]).range([INNER_HEIGHT, 0]);

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            const yAxisGrid = axisLeft(y.nice())
                .ticks(5)
                .tickSize(-INNER_WIDTH)
                .tickPadding(8);
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxisGrid);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr(
                    "d",
                    line<{ [name: string]: number; time: number }>()
                        .x(d => x(timestampToDate(d.time)) ?? 0)
                        .y(d => y(d.n))
                );

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", 3)
                .attr("fill", color)
                .style("stroke", color)
                .style("stroke-width", 5)
                .style("stroke-opacity", 0)
                .attr("transform", d => `translate(${x(timestampToDate(d.time))}, ${y(d.n)})`)
                .attr("class", (_, i) => `rect-${i}`)
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler);

            let ticks;
            switch (timespan) {
                case "7":
                    ticks = 7;
                    break;
                case "30":
                    ticks = 7;
                    break;
                default:
                    ticks = data.length / 4;
                    break;
            }

            const xAxis = axisBottom(x).ticks(ticks);
            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .call(xAxis);
        }
    }, [data, timespan]);

    /**
     * Handles mouseover event of a circle
     * @param this The mouse hovered element
     * @param _ The unused event param
     * @param dataPoint The data point rendered by this rect
     */
    function mouseoverHandler(
        this: SVGRectElement | BaseType,
        _: unknown,
        dataPoint: { [key: string]: number }
    ) {
        // show tooltip
        select(theTooltip.current)
            .style("display", "block")
            .select("#content")
            .html(buildTooltip(dataPoint));
        // add highlight
        select(this)
            .style("stroke-opacity", 0.5);
    }

    /**
     * Handles mouseout event of a circle
     * @param this The mouse hovered element
     * @param _ The unused event param
     */
    function mouseoutHandler(
        this: SVGRectElement | BaseType,
        _: unknown
    ) {
        // remove tooltip
        select(theTooltip.current).style("display", "none");
        // remove highlight
        select(this)
            .style("stroke-opacity", 0);
    }

    return (
        <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
                onTimespanSelected={value => setTimespan(value)}
                disabled={data.length === 0}
            />
            {data.length === 0 ? (
                noDataView()
            ) : (
                <div className="chart-wrapper__content" ref={chartRef}>
                    <ChartTooltip tooltipRef={theTooltip} />
                    <svg className="hook" ref={theSvg} />
                </div>
            )}
        </div>
    );
};

LineChart.defaultProps = {
    label: undefined,
    title: undefined
};

export default LineChart;
