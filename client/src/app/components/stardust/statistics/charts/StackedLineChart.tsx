// import { axisBottom, axisLabelRotate } from "@d3fc/d3fc-axis";
import classNames from "classnames";
import { axisBottom, axisLeft } from "d3-axis";
import { brushX, D3BrushEvent } from "d3-brush";
import { format } from "d3-format";
import { scaleTime, scaleLinear, scaleOrdinal, NumberValue } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { area, line, SeriesPoint, stack } from "d3-shape";
import moment from "moment";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    d3FormatSpecifier,
    determineGraphLeftPadding,
    noDataView,
    useChartWrapperSize,
    useMultiValueTooltip,
    useTouchMoveEffect
} from "../ChartUtils";
import "./Chart.scss";

interface StackedLineChartProps {
    chartId: string;
    title?: string;
    info?: ModalData;
    subgroups: string[];
    groupLabels?: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({
    chartId,
    title,
    info,
    subgroups,
    groupLabels,
    colors,
    data
}) => {
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);
    const theSvg = useRef<SVGSVGElement>(null);
    const theTooltip = useRef<HTMLDivElement>(null);
    const [timespan, setTimespan] = useState<TimespanOption>("all");
    const buildTootip = useMultiValueTooltip(data, subgroups, colors, groupLabels);

    useTouchMoveEffect(mouseoutHandler);

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;
            // reset
            select(theSvg.current).selectAll("*").remove();

            data = timespan !== "all" ? data.slice(-timespan) : data;

            // chart dimensions
            const yMax = Math.max(...data.map(d => Math.max(...subgroups.map(key => d[key]))));
            const leftMargin = determineGraphLeftPadding(yMax);
            const MARGIN = { top: 30, right: 20, bottom: 50, left: leftMargin };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

            const timestampToDate = (timestamp: number) => moment.unix(timestamp)
                .hours(0)
                .minutes(0)
                .toDate();

            const color = scaleOrdinal<string>().domain(subgroups).range(colors);

            const stackedData = stack().keys(subgroups)(data);

            const groups = data.map(
                d => timestampToDate(d.time)
            );

            // SVG
            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "none")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            // X
            const x = scaleTime()
                .domain([groups[0], groups[groups.length - 1]])
                .range([0, INNER_WIDTH]);
            const xAxis = axisBottom(x);

            const xAxisSelection = svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                .call(xAxis);

            // Y
            const y = scaleLinear().domain([0, yMax])
                .range([INNER_HEIGHT, 0]);

            const yAxisGrid = axisLeft(y.nice()).tickFormat(format(d3FormatSpecifier(yMax)));
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxisGrid);

            // clap path
            svg.append("defs")
                .append("clipPath")
                .attr("id", `clip-${chartId}`)
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);

            // area fill
            const areaGen = area<SeriesPoint<{ [key: string]: number }>>()
                .x(d => x(timestampToDate(d.data.time)) ?? 0)
                .y0(_ => y(0))
                .y1(d => y(d[1] - d[0]));

            const theArea = svg.append("g")
                .attr("class", "areas")
                .attr("clip-path", `url(#clip-${chartId})`);

            const areaSelection = theArea.selectAll("g")
                .data(stackedData)
                .join("path")
                .style("fill", d => getGradient(d.key, color(d.key)))
                .attr("opacity", 0.5)
                .attr("class", "area")
                .attr("d", areaGen);

            // area lines path
            const lineGen = line<SeriesPoint<{ [key: string]: number }>>()
                .x(d => x(timestampToDate(d.data.time)) ?? 0)
                .y(d => y(d[1] - d[0]));

            const lineSelection = svg.append("g")
                .attr("class", "lines")
                .attr("clip-path", `url(#clip-${chartId})`)
                .selectAll("g")
                .data(stackedData)
                .join("path")
                .attr("fill", "none")
                .attr("stroke", d => color(d.key))
                .attr("stroke-width", 2)
                .attr("class", "line")
                .attr("d", lineGen);

            const attachOnHoverLinesAndCircles = () => {
                svg.selectAll(".hover-circles").remove();
                svg.selectAll(".hover-lines").remove();
                const halfLineWidth = data.length > 1 ?
                    ((x(timestampToDate(data[1].time)) ?? 0) - (x(timestampToDate(data[0].time)) ?? 0)) / 2 :
                    18;

                for (const dataStack of stackedData) {
                    svg.append("g")
                        .attr("class", "hover-circles")
                        .attr("clip-path", `url(#clip-${chartId})`)
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
                        .attr("r", 0)
                        .attr("class", (_, i) => `circle-${i}`);
                }

                // hover lines for tooltip
                svg.append("g")
                    .attr("class", "hover-lines")
                    .attr("clip-path", `url(#clip-${chartId})`)
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
                    .attr("width", (_, idx) => (
                        (idx === 0 || idx === data.length - 1) ?
                            halfLineWidth : halfLineWidth * 2
                    ))
                    .on("mouseover", mouseoverHandler)
                    .on("mouseout", mouseoutHandler);
            };

            // brushing
            const brush = brushX()
                .extent([[0, 0], [INNER_WIDTH, height]])
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                .on("end", e => onBrushHandler(e));

            const brushSelection = theArea.append("g")
                .attr("class", "brush")
                .call(brush);

            let idleTimeout: NodeJS.Timer | null = null;
            const idled = () => {
                idleTimeout = null;
            };
            const onBrushHandler = (event: D3BrushEvent<{ [key: string]: number }>) => {
                if (!event.selection) {
                    return;
                }
                const extent = event.selection;
                if (!extent) {
                    if (!idleTimeout) {
                        idleTimeout = setTimeout(idled, 350);
                        return idleTimeout;
                    }
                    x.domain([groups[0], groups[groups.length - 1]]);
                } else {
                    console.log(extent);
                    console.log(x.invert(extent[0] as NumberValue));
                    console.log(x.invert(extent[1] as NumberValue));
                    x.domain([x.invert(extent[0] as NumberValue), x.invert(extent[1] as NumberValue)]);
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    brushSelection.call(brush.move, null);
                }

                // Update axis, area and lines position
                xAxisSelection.transition().duration(1000).call(axisBottom(x));
                areaSelection
                    .transition()
                    .duration(750)
                    .attr("d", areaGen);
                lineSelection
                    .transition()
                    .duration(750)
                    .attr("d", lineGen);

                // rebuild the hover activated lines & cicles
                attachOnHoverLinesAndCircles();
            };

            // double click reset
            svg.on("dblclick", () => {
                x.domain([groups[0], groups[groups.length - 1]]);
                xAxisSelection.transition().call(axisBottom(x));
                areaSelection
                    .transition()
                    .duration(500)
                    .attr("d", areaGen);
                lineSelection
                    .transition()
                    .duration(500)
                    .attr("d", lineGen);

                attachOnHoverLinesAndCircles();
            });

            attachOnHoverLinesAndCircles();
        }
    }, [data, timespan, wrapperWidth, wrapperHeight]);

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
        const eleClass = (this as SVGRectElement).classList[0];
        const idx = eleClass.slice(eleClass.indexOf("-") + 1);
        select(theSvg.current)
            .selectAll(`.circle-${idx}`)
            .attr("r", 2)
            .style("stroke-opacity", 0.5);

        select(this)
            .classed("active", true);
    }

    /**
     * Handles mouseout event.
     */
    function mouseoutHandler() {
        // remove tooltip
        select(theTooltip.current).style("display", "none");
        // remove highlight
        const activeElement = select(theSvg.current)
            .select(".active");
        if (activeElement.size() > 0) {
            const elClass = activeElement.attr("class");
            const idx = elClass.slice(
                elClass.indexOf("rect-") + 5,
                elClass.lastIndexOf(" ")
            );

            select(theSvg.current)
                .selectAll(`.circle-${idx}`)
                .attr("r", 0)
                .style("stroke-opacity", 0);

            activeElement
                .classed("active", false);
        }
    }

    return (
        <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
                info={info}
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
                <div className="chart-wrapper__content" ref={chartWrapperRef}>
                    <ChartTooltip tooltipRef={theTooltip} />
                    <svg className="hook" ref={theSvg} />
                </div>
            )}
        </div>
    );
};

StackedLineChart.defaultProps = {
    groupLabels: undefined,
    info: undefined,
    title: undefined
};

export default StackedLineChart;
