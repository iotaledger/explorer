import { axisBottom, axisLeft } from "d3-axis";
import { scaleTime, scaleLinear, scaleOrdinal } from "d3-scale";
import { area, line, SeriesPoint, stack } from "d3-shape";
import { BaseType, select } from "d3-selection";
import moment from "moment";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import "./StackedLineChart.scss";

interface StackedLineChartProps {
    title?: string;
    width: number;
    height: number;
    subgroups: string[];
    groupLabels?: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({
    title,
    height,
    width,
    subgroups,
    groupLabels,
    colors,
    data
}) => {
    const theSvg = useRef<SVGSVGElement>(null);
    const theTooltip = useRef<HTMLDivElement>(null);
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
            .y0(d => y(0))
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
            .x(
                d => x(moment.unix(d.data.time)
                .hours(0)
                .minutes(0)
                .toDate()) ??
                0
            )
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
                .attr("cx", d => x(moment.unix(d.data.time)
                        .hours(0)
                        .minutes(0)
                        .toDate()) ??
                        0
                )
                .attr("cy", d => y(d[1] - d[0]))
                .attr("r", 3)
                .attr("class", (_, i) => `rect-${i}`)
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler);
        }
    }, [width, height, data, timespan]);

    const buildTooltipHtml = useCallback((dataPoint: { [key: string]: number }): string => (
        `
            <p>${moment.unix(dataPoint.time).format("DD-MM-YYYY")}</p>
            ${subgroups.map((subgroup, idx) => (
            `
                <p>
                    <span class="dot" style="background-color: ${colors[idx]}"></span>
                    <span class="label">${groupLabels ? groupLabels[idx] : subgroup}: </span>
                    <span class="value">${dataPoint[subgroup]}</span>
                </p>
            `
        )).join("")}
        `
    ), [subgroups, data]);

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
     * Handles mouseover event of a circle
     * @param this The mouse hovered element
     * @param _ The unused event param
     * @param dataPoint The data point rendered by this rect
     */
     function mouseoverHandler(
        this: SVGRectElement | BaseType,
        _: unknown,
        dataPoint: SeriesPoint<{ [key: string]: number }>
    ) {
        // show tooltip
        select(theTooltip.current)
            .style("display", "block")
            .select("#content")
            .html(buildTooltipHtml(dataPoint.data));
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
        <div className="line-chart--wrapper">
            <ChartHeader
                title={title}
                onTimespanSelected={value => setTimespan(value)}
                legend={{
                    labels: subgroups,
                    colors
                }}
            />
            <ChartTooltip tooltipRef={theTooltip} />
            <svg className="hook" ref={theSvg} />
        </div>
    );
};

StackedLineChart.defaultProps = {
    groupLabels: undefined,
    title: undefined
};

export default StackedLineChart;
