import classNames from "classnames";
import { axisBottom, axisLeft } from "d3-axis";
import { brushX, D3BrushEvent } from "d3-brush";
import { format } from "d3-format";
import { NumberValue, scaleLinear, scaleOrdinal, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { SeriesPoint, stack } from "d3-shape";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    useMultiValueTooltip,
    noDataView,
    useChartWrapperSize,
    determineGraphLeftPadding,
    d3FormatSpecifier,
    useTouchMoveEffect,
    tickMultiFormat,
    timestampToDate
} from "../ChartUtils";
import "./Chart.scss";

interface StackedBarChartProps {
    chartId: string;
    title?: string;
    info?: ModalData;
    subgroups: string[];
    groupLabels?: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
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
    const buildTooltip = useMultiValueTooltip(data, subgroups, colors, groupLabels);

    useTouchMoveEffect(mouseoutHandler);

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;
            // reset
            select(theSvg.current).select("*").remove();

            data = timespan !== "all" ? data.slice(-timespan) : data;

            // chart dimensions
            const yMax = Math.max(
                ...data.map(d => {
                    let sum = 0;
                    for (const key of subgroups) {
                        sum += d[key];
                    }
                    return sum;
                })
            );
            const leftMargin = determineGraphLeftPadding(yMax);
            const MARGIN = { top: 30, right: 20, bottom: 50, left: leftMargin };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

            const color = scaleOrdinal<string>().domain(subgroups).range(colors);

            const groups = data.map(
                d => timestampToDate(d.time)
            );
            const stackedData = stack().keys(subgroups)(data);

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

            const xAxis = axisBottom(x).tickFormat(tickMultiFormat);

            const xAxisSelection = svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .call(xAxis);

            // Y
            const y = scaleLinear().domain([0, yMax])
                .range([INNER_HEIGHT, 0]);
            const yAxisGrid = axisLeft(y.nice()).tickFormat(format(d3FormatSpecifier(yMax)));
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxisGrid);

            // clip path
            svg.append("defs")
                .append("clipPath")
                .attr("id", `clip-${chartId}`)
                .append("rect")
                .attr("width", INNER_WIDTH)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);

            // brushing
            const brush = brushX()
                .extent([[0, 0], [INNER_WIDTH, height]])
                .on("end", e => onBrushHandler(e as D3BrushEvent<{ [key: string]: number }>));

            const brushSelection = svg.append("g")
                .attr("class", "brush")
                .call(brush);

            // bars
            const barsSelection = svg.append("g")
                .attr("class", "stacked-bars")
                .attr("clip-path", `url(#clip-${chartId})`);

            const renderBars = (datesLen: number) => {
                barsSelection.selectAll("g")
                    .data(stackedData)
                    .join("g")
                    .attr("fill", d => color(d.key))
                    .selectAll("rect")
                    .data(d => d)
                    .join("rect")
                    .attr("x", d => x(timestampToDate(d.data.time)) - ((INNER_WIDTH / datesLen) / 2))
                    .attr("y", d => y(d[1]))
                    .attr("class", (_, i) => `stacked-bar rect-${i}`)
                    .on("mouseover", mouseoverHandler)
                    .on("mouseout", mouseoutHandler)
                    .attr("height", d => y(d[0]) - y(d[1]))
                    .attr("width", INNER_WIDTH / datesLen);
            };

            renderBars(data.length);

            const onBrushHandler = (event: D3BrushEvent<{ [key: string]: number }>) => {
                if (!event.selection) {
                    return;
                }
                const extent = event.selection;
                if (!extent) {
                    x.domain([groups[0], groups[groups.length - 1]]);
                } else {
                    x.domain([x.invert(extent[0] as NumberValue), x.invert(extent[1] as NumberValue)]);
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    brushSelection.call(brush.move, null);
                }

                // compute bars count included in barsSelection
                const from = x.domain()[0];
                from.setHours(0, 0, 0, 0);
                const to = x.domain()[1];
                to.setHours(0, 0, 0, 0);
                let barsCount = 0;
                for (const d of data) {
                    const target = timestampToDate(d.time);
                    target.setHours(0, 0, 0, 0);
                    if (from <= target && target <= to) {
                        barsCount++;
                    }
                }

                // Update bars
                renderBars(barsCount);
                // Update axis, area and lines position
                xAxisSelection.transition().duration(1000).call(axisBottom(x).tickFormat(tickMultiFormat));
            };

            // double click reset
            svg.on("dblclick", () => {
                x.domain([groups[0], groups[groups.length - 1]]);
                xAxisSelection.transition().call(axisBottom(x).tickFormat(tickMultiFormat));
                renderBars(data.length);
            });
        }
    }, [data, timespan, wrapperWidth, wrapperHeight]);

    /**
     * Handles mouseover event of a bar "part"
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
            .html(buildTooltip(dataPoint.data));
        // add highlight
        select(this).classed("active", true);
    }

    /**
     * Handles mouseout event of a bar "part"
     */
    function mouseoutHandler() {
        // remove tooltip
        select(theTooltip.current).style("display", "none");
        // remove highlight
        select(theSvg.current)
            .select(".active")
            .classed("active", false);
    }

    return (
        <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
                info={info}
                legend={{
                    labels: groupLabels ?? subgroups,
                    colors
                }}
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

StackedBarChart.defaultProps = {
    groupLabels: undefined,
    info: undefined,
    title: undefined
};

export default StackedBarChart;

