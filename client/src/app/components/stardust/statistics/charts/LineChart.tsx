import classNames from "classnames";
import { max } from "d3-array";
import { brushX, D3BrushEvent } from "d3-brush";
import { NumberValue, scaleLinear, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { line } from "d3-shape";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    buildXAxis,
    buildYAxis,
    computeDataIncludedInSelection,
    computeHalfLineWidth,
    determineGraphLeftPadding,
    noDataView,
    timestampToDate,
    TRANSITIONS_DURATION_MS,
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
    const buildTooltip = useSingleValueTooltip(data, label);

    useTouchMoveEffect(mouseoutHandler);

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;
            // reset
            select(theSvg.current).select("*").remove();

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

                const halfLineWidth = computeHalfLineWidth(data, x);
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

                const from = x.domain()[0];
                from.setHours(0, 0, 0, 0);
                const to = x.domain()[1];
                to.setHours(0, 0, 0, 0);
                const selectedData = computeDataIncludedInSelection(x, data);
                const yMaxUpdate = max(selectedData, d => d.n) ?? 1;
                y.domain([0, yMaxUpdate]);
                yAxisSelection.transition().duration(TRANSITIONS_DURATION_MS).call(buildYAxis(y, yMaxUpdate));

                // Update axis, area and lines position
                xAxisSelection.transition().duration(TRANSITIONS_DURATION_MS).call(buildXAxis(x));
                lineSelection.transition().duration(TRANSITIONS_DURATION_MS).attr("d", lineGen);

                // rebuild the hover activated lines & cicles
                attachPathAndCircles();
            };

            // double click reset
            svg.on("dblclick", () => {
                x.domain([dates[0], dates[dates.length - 1]]);
                xAxisSelection.transition().call(buildXAxis(x));
                y.domain([0, yMax]);
                yAxisSelection.transition().duration(TRANSITIONS_DURATION_MS).call(buildYAxis(y, yMax));
                lineSelection.transition().duration(TRANSITIONS_DURATION_MS).attr("d", lineGen);
                attachPathAndCircles();
            });
        }
    }, [data, wrapperWidth, wrapperHeight]);

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
