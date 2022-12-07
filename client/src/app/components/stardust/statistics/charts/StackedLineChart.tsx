import classNames from "classnames";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleTime, scaleLinear, scaleOrdinal } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { area, line, SeriesPoint, stack } from "d3-shape";
import { timeFormat } from "d3-time-format";
import moment from "moment";
import React, { useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import { noDataView, useMultiValueTooltip } from "../ChartUtils";
import "./Chart.scss";

interface StackedLineChartProps {
    title?: string;
    subgroups: string[];
    groupLabels?: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({
    title,
    subgroups,
    groupLabels,
    colors,
    data
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const theSvg = useRef<SVGSVGElement>(null);
    const theTooltip = useRef<HTMLDivElement>(null);
    const [timespan, setTimespan] = useState<TimespanOption>("30");
    const buildTootip = useMultiValueTooltip(data, subgroups, colors, groupLabels);

    useLayoutEffect(() => {
        if (data.length > 0) {
            const width = chartRef.current?.clientWidth ?? 0;
            const height = chartRef.current?.clientHeight ?? 0;

            const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;
            // reset
            select(theSvg.current).selectAll("*").remove();

            const timestampToDate = (timestamp: number) => moment.unix(timestamp)
                .hours(0)
                .minutes(0)
                .toDate();

            const color = scaleOrdinal<string>().domain(subgroups).range(colors);

            data = timespan !== "all" ? data.slice(-timespan) : data;

            const stackedData = stack().keys(subgroups)(data);

            const groups = data.map(
                d => timestampToDate(d.time)
            );

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
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

            const xAxis = axisBottom<Date>(x)
                .ticks(tickValues)
                .tickFormat(timeFormat("%d %b"));

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .call(xAxis);

            const areaGen = area<SeriesPoint<{ [key: string]: number }>>()
                .x(d => x(timestampToDate(d.data.time)) ?? 0)
                .y0(_ => y(0))
                .y1(d => y(d[1] - d[0]));

            svg.append("g")
                .selectAll("g")
                .data(stackedData)
                .join("path")
                .style("fill", d => getGradient(d.key, color(d.key)))
                .attr("opacity", 0.5)
                .attr("class", "area")
                .attr("d", areaGen);

            const lineGen = line<SeriesPoint<{ [key: string]: number }>>()
                .x(d => x(timestampToDate(d.data.time)) ?? 0)
                .y(d => y(d[1] - d[0]));

            svg.append("g")
                .selectAll("g")
                .data(stackedData)
                .join("path")
                .attr("fill", "none")
                .attr("stroke", d => color(d.key))
                .attr("stroke-width", 2)
                .attr("d", lineGen);

            for (const dataStack of stackedData) {
                svg.append("g")
                    .selectAll("g")
                    .data(dataStack)
                    .enter()
                    .append("circle")
                    .attr("fill", color(dataStack.key))
                    .style("stroke", color(dataStack.key))
                    .style("stroke-width", 5)
                    .style("stroke-opacity", 0)
                    .attr("cx", d => x(timestampToDate(d.data.time)) ?? 0)
                    .attr("cy", d => y(d[1] - d[0]))
                    .attr("r", 1)
                    .attr("class", (_, i) => `circle-${i}`);
            }

            const halfLineWidth = data.length > 1 ?
                ((x(timestampToDate(data[1].time)) ?? 0) - (x(timestampToDate(data[0].time)) ?? 0)) / 2 :
                18;

            svg.append("g")
                .attr("class", "hover-lines")
                // .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .selectAll("g")
                .data(data)
                .enter()
                .append("rect")
                .attr("fill", "transparent")
                .attr("x", (_, idx) => (
                    idx === 0 ? 0 : (x(timestampToDate(data[idx].time)) ?? 0) - halfLineWidth
                ))
                .attr("y", 0)
                .attr("class", (_, i) => `rect-${i}`)
                .attr("height", INNER_HEIGHT)
                .attr("width", (_, idx) => {
                    if (idx === 0) {
                        return halfLineWidth;
                    } else if (idx === data.length - 1) {
                        return halfLineWidth;
                    }

                    return halfLineWidth * 2;
                })
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler);
        }
    }, [data, timespan]);

    /**
     * Get linear gradient for selected color
     * @param id The id for the gradient element
     * @param color The color for the gradient
     * @returns The gradient
     */
    function getGradient(id: string, color: string): string {
        const areaGradient = select(theSvg.current).append("defs")
            .append("linearGradient")
            .attr("id", `aG-${id}`)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        areaGradient
            .append("stop")
            .attr("offset", "30%")
            .attr("stop-color", color)
            .attr("stop-opacity", 0.6);

        areaGradient.append("stop")
            .attr("offset", "90%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0);

        return `url(#aG-${id})`;
    }

    /**
     * Handles mouseover event.
     * @param this The mouse hovered element
     * @param _ The unused event param
     * @param dataPoint The data point rendered by this rect
     */
    function mouseoverHandler(
        this: SVGRectElement | BaseType,
        _: MouseEvent,
        dataPoint: { [key: string]: number }
    ) {
        // show tooltip
        select(theTooltip.current)
            .style("display", "block")
            .select("#content")
            .html(buildTootip(dataPoint));
            // add highlight
        const eleClass = (this as SVGRectElement).classList.value;
        const idx = eleClass.slice(eleClass.indexOf("-") + 1);
        select(theSvg.current)
            .selectAll(`.circle-${idx}`)
            .attr("r", 2)
            .style("stroke-opacity", 0.5);
    }

    /**
     * Handles mouseout event.
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
        const eleClass = (this as SVGRectElement).classList.value;
        const idx = eleClass.slice(eleClass.indexOf("-") + 1);
        select(theSvg.current)
            .selectAll(`.circle-${idx}`)
            .attr("r", 1)
            .style("stroke-opacity", 0);
    }

    return (
        <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
                onTimespanSelected={value => setTimespan(value)}
                legend={{
                    labels: groupLabels ?? subgroups,
                    colors
                }}
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

StackedLineChart.defaultProps = {
    groupLabels: undefined,
    title: undefined
};

export default StackedLineChart;
