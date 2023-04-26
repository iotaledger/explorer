import classNames from "classnames";
import { max } from "d3-array";
import { Axis, axisBottom, axisLeft } from "d3-axis";
import { brushX, D3BrushEvent } from "d3-brush";
import { format } from "d3-format";
import { NumberValue, scaleLinear, ScaleTime, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { line } from "d3-shape";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    d3FormatSpecifier,
    determineGraphLeftPadding,
    noDataView,
    tickMultiFormat,
    timestampToDate,
    useChartWrapperSize,
    useSingleValueTooltip,
    useTouchMoveEffect
} from "../ChartUtils";
import "./Chart.scss";

interface LineChartProps {
    chartId: string;
    title?: string;
    info?: ModalData;
    data: { [name: string]: number; time: number }[];
    label?: string;
    color: string;
}

const LineChart: React.FC<LineChartProps> = ({ chartId, title, info, data, label, color }) => {
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

    useTouchMoveEffect(mouseoutHandler);

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;
            // reset
            select(theSvg.current).select("*").remove();

            data = timespan !== "all" ? data.slice(-timespan) : data;

            // chart dimensions
            const yMax = max(data, d => d.n) ?? 1;
            const leftMargin = determineGraphLeftPadding(yMax);
            const MARGIN = { top: 30, right: 20, bottom: 50, left: leftMargin };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

            const dates = data.map(d => timestampToDate(d.time));

            // SVG
            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "none")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            // X
            const x = scaleTime()
                .domain([dates[0], dates[dates.length - 1]])
                .range([0, INNER_WIDTH]);

            const buildXAxis: (scale: ScaleTime<number, number>) => Axis<Date> = scale =>
                axisBottom(scale).tickFormat(tickMultiFormat) as Axis<Date>;

            const xAxisSelection = svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .call(buildXAxis(x));

            // Y
            const y = scaleLinear().domain([0, yMax]).range([INNER_HEIGHT, 0]);
            const yAxisGrid = axisLeft(y.nice()).tickFormat(format(d3FormatSpecifier(yMax)));
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxisGrid);

            // clip path
            svg.append("defs")
                .append("clipPath")
                .attr("id", `clip-${chartId}`)
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);

            // brushing
            const brush = brushX()
                .extent([[0, 0], [INNER_WIDTH, height]])
                .on("end", e => {
                    onBrushHandler(e as D3BrushEvent<{ [key: string]: number }>);
                });

            const brushSelection = svg.append("g")
                .attr("class", "brush")
                .call(brush);

            // line
            const lineGen = line<{ [name: string]: number; time: number }>()
                .x(d => x(timestampToDate(d.time)) ?? 0)
                .y(d => y(d.n));

            const lineSelection = svg.append("g")
                .attr("class", "the-line")
                .attr("clip-path", `url(#clip-${chartId})`)
                .append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("d", lineGen);

            const attachPathAndCircles = () => {
                svg.selectAll(".hover-circles").remove();
                svg.selectAll(".hover-lines").remove();
                const halfLineWidth = data.length > 1 ?
                    ((x(timestampToDate(data[1].time)) ?? 0) - (x(timestampToDate(data[0].time)) ?? 0)) / 2 :
                    18;

                svg.append("g")
                    .attr("class", "hover-circles")
                    .selectAll("g")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("r", 0)
                    .attr("fill", color)
                    .style("stroke", color)
                    .style("stroke-width", 5)
                    .style("stroke-opacity", 0)
                    .attr("transform", d => `translate(${x(timestampToDate(d.time))}, ${y(d.n)})`)
                    .attr("class", (_, i) => `circle-${i}`);

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
            };

            attachPathAndCircles();

            const onBrushHandler = (event: D3BrushEvent<{ [key: string]: number }>) => {
                if (!event.selection) {
                    return;
                }
                const extent = event.selection;
                if (!extent) {
                    x.domain([dates[0], dates[dates.length - 1]]);
                } else {
                    x.domain([x.invert(extent[0] as NumberValue), x.invert(extent[1] as NumberValue)]);
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    brushSelection.call(brush.move, null);
                }

                // Update axis, area and lines position
                xAxisSelection.transition().duration(1000).call(buildXAxis(x));
                lineSelection
                    .transition()
                    .duration(750)
                    .attr("d", lineGen);

                // rebuild the hover activated lines & cicles
                attachPathAndCircles();
            };

            // double click reset
            svg.on("dblclick", () => {
                x.domain([dates[0], dates[dates.length - 1]]);
                xAxisSelection.transition().call(axisBottom(x).tickFormat(tickMultiFormat));
                lineSelection
                    .transition()
                    .duration(500)
                    .attr("d", lineGen);
                attachPathAndCircles();
            });
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
        <div className={classNames("chart-wrapper line-chart", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
                info={info}
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
    info: undefined,
    label: undefined,
    title: undefined
};

export default LineChart;
