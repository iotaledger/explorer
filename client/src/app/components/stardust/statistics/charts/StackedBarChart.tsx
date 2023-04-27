import classNames from "classnames";
import { brushX, D3BrushEvent } from "d3-brush";
import { NumberValue, scaleLinear, scaleOrdinal, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { SeriesPoint, stack } from "d3-shape";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    useMultiValueTooltip,
    noDataView,
    useChartWrapperSize,
    determineGraphLeftPadding,
    useTouchMoveEffect,
    timestampToDate,
    buildXAxis,
    buildYAxis,
    computeDataIncludedInSelection
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
    const buildTooltip = useMultiValueTooltip(data, subgroups, colors, groupLabels);

    useTouchMoveEffect(mouseoutHandler);

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;
            // reset
            select(theSvg.current).select("*").remove();

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
            const xAxisSelection = svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .call(buildXAxis(x));

            // Y
            const y = scaleLinear().domain([0, yMax]).range([INNER_HEIGHT, 0]);
            const yAxisSelection = svg.append("g")
                .attr("class", "axis axis--y")
                .call(buildYAxis(y, yMax));

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
                .attr("clip-path", `url(#clip-${chartId})`)
                .selectAll("g")
                .data(stackedData)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x(timestampToDate(d.data.time)) - ((INNER_WIDTH / data.length) / 2))
                .attr("y", d => y(d[1]))
                .attr("rx", 2)
                .attr("class", (_, i) => `stacked-bar rect-${i}`)
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler)
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", INNER_WIDTH / data.length);

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

                const selectedData = computeDataIncludedInSelection(x, data);
                const yMaxUpdate = Math.max(
                    ...selectedData.map(d => {
                        let sum = 0;
                        for (const key of subgroups) {
                            sum += d[key];
                        }
                        return sum;
                    })
                );
                y.domain([0, yMaxUpdate]);
                yAxisSelection.transition().duration(750).call(buildYAxis(y, yMaxUpdate));

                // Update bars
                barsSelection.transition().duration(1000)
                    .attr("x", d => x(timestampToDate(d.data.time)) - ((INNER_WIDTH / selectedData.length) / 2))
                    .attr("y", d => y(d[1]))
                    .attr("height", d => y(d[0]) - y(d[1]))
                    .attr("width", INNER_WIDTH / selectedData.length);
                // Update axis, area and lines position
                xAxisSelection.transition().duration(1000).call(buildXAxis(x));
            };

            // double click reset
            svg.on("dblclick", () => {
                x.domain([groups[0], groups[groups.length - 1]]);
                xAxisSelection.transition().call(buildXAxis(x));
                y.domain([0, yMax]);
                yAxisSelection.transition().duration(750).call(buildYAxis(y, yMax));
                barsSelection.transition().duration(1000)
                    .attr("x", d => x(timestampToDate(d.data.time)) - ((INNER_WIDTH / data.length) / 2))
                    .attr("y", d => y(d[1]))
                    .attr("height", d => y(d[0]) - y(d[1]))
                    .attr("width", INNER_WIDTH / data.length);
            });
        }
    }, [data, wrapperWidth, wrapperHeight]);

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

