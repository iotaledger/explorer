import classNames from "classnames";
import { max } from "d3-array";
import { brushX, D3BrushEvent } from "d3-brush";
import { NumberValue, scaleLinear, scaleTime } from "d3-scale";
import { BaseType, select } from "d3-selection";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    buildXAxis,
    buildYAxis,
    computeDataIncludedInSelection,
    determineGraphLeftPadding,
    noDataView,
    timestampToDate,
    useChartWrapperSize,
    useSingleValueTooltip,
    useTouchMoveEffect
} from "../ChartUtils";
import "./Chart.scss";

interface BarChartProps {
    chartId: string;
    title?: string;
    info?: ModalData;
    data: { [name: string]: number; time: number }[];
    label?: string;
    color: string;
}

const BarChart: React.FC<BarChartProps> = ({ chartId, title, info, data, label, color }) => {
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);
    const theTooltip = useRef<HTMLDivElement>(null);
    const theSvg = useRef<SVGSVGElement>(null);
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
            const y = scaleLinear().domain([0, yMax])
                .range([INNER_HEIGHT, 0]);
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
                .attr("class", "the-bars")
                .attr("clip-path", `url(#clip-${chartId})`)
                .selectAll("g")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(timestampToDate(d.time)) - ((INNER_WIDTH / data.length) / 2))
                .attr("y", d => y(d.n))
                .attr("fill", color)
                .attr("rx", 2)
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler)
                .attr("width", INNER_WIDTH / data.length)
                .attr("height", d => INNER_HEIGHT - y(d.n));

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

                const selectedData = computeDataIncludedInSelection(x, data);
                const yMaxUpdate = max(selectedData, d => d.n) ?? 1;
                y.domain([0, yMaxUpdate]);
                yAxisSelection.transition().duration(750).call(buildYAxis(y, yMaxUpdate));

                // Update bars
                barsSelection.transition().duration(1000)
                    .attr("x", d => x(timestampToDate(d.time)) - ((INNER_WIDTH / selectedData.length) / 2))
                    .attr("y", d => y(d.n))
                    .attr("width", INNER_WIDTH / selectedData.length)
                    .attr("height", d => INNER_HEIGHT - y(d.n));

                // Update axis, area and lines position
                xAxisSelection.transition().duration(750).call(buildXAxis(x));
            };

            // double click reset
            svg.on("dblclick", () => {
                x.domain([dates[0], dates[dates.length - 1]]);
                xAxisSelection.transition().duration(750).call(buildXAxis(x));
                y.domain([0, yMax]);
                yAxisSelection.transition().duration(750).call(buildYAxis(y, yMax));
                barsSelection.transition().duration(1000)
                    .attr("x", d => x(timestampToDate(d.time)) - ((INNER_WIDTH / data.length) / 2))
                    .attr("y", d => y(d.n))
                    .attr("width", INNER_WIDTH / data.length)
                    .attr("height", d => INNER_HEIGHT - y(d.n));
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
        dataPoint: { [key: string]: number }
    ) {
        // show tooltip
        select(theTooltip.current)
            .style("display", "block")
            .select("#content")
            .html(buildTooltip(dataPoint));
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

BarChart.defaultProps = {
    info: undefined,
    label: undefined,
    title: undefined
};

export default BarChart;

