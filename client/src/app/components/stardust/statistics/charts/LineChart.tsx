import { axisBottom, axisLabelRotate } from "@d3fc/d3fc-axis";
import classNames from "classnames";
import { max } from "d3-array";
import { axisLeft } from "d3-axis";
import { scaleLinear, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { line } from "d3-shape";
import { timeFormat } from "d3-time-format";
import moment from "moment";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import { noDataView, useChartWrapperSize, useSingleValueTooltip } from "../ChartUtils";
import "./Chart.scss";

interface LineChartProps {
    title?: string;
    data: { [name: string]: number; time: number }[];
    label?: string;
    color: string;
}

const LineChart: React.FC<LineChartProps> = ({ title, data, label, color }) => {
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);
    const theSvg = useRef<SVGSVGElement>(null);
    const theTooltip = useRef<HTMLDivElement>(null);
    const [timespan, setTimespan] = useState<TimespanOption>("all");
    const buildTooltip = useSingleValueTooltip(data, label);

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;

            const MARGIN = { top: 30, right: 20, bottom: 50, left: 50 };
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
                .attr("preserveAspectRatio", "none")
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
                .attr("r", 1)
                .attr("fill", color)
                .style("stroke", color)
                .style("stroke-width", 5)
                .style("stroke-opacity", 0)
                .attr("transform", d => `translate(${x(timestampToDate(d.time))}, ${y(d.n)})`)
                .attr("class", (_, i) => `circle-${i}`);

            const xAxis = axisLabelRotate(
                axisBottom(x).tickFormat(timeFormat("%d %b"))
            );

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                .call(xAxis);

            const halfLineWidth = data.length > 1 ?
                ((x(timestampToDate(data[1].time)) ?? 0) - (x(timestampToDate(data[0].time)) ?? 0)) / 2 :
                18;

            svg.append("g")
                .attr("class", "hover-lines")
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
    }, [data, timespan, wrapperWidth, wrapperHeight]);

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
            .html(buildTooltip(dataPoint));
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
        <div className={classNames("chart-wrapper line-chart", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
                onTimespanSelected={value => setTimespan(value)}
                disabled={data.length === 0}
            />
            {data.length === 0 ? (
                noDataView()
            ) : (
                <div className="chart-wrapper__content" ref={chartWrapperRef}>
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
