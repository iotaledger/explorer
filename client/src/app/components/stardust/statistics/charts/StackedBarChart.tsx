import { axisBottom, axisLabelRotate } from "@d3fc/d3fc-axis";
import classNames from "classnames";
import { axisLeft } from "d3-axis";
import { format } from "d3-format";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { SeriesPoint, stack } from "d3-shape";
import moment from "moment";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
    useMultiValueTooltip,
    noDataView,
    useChartWrapperSize,
    determineGraphLeftPadding,
    d3FormatSpecifier
} from "../ChartUtils";
import "./Chart.scss";

interface StackedBarChartProps {
    title?: string;
    subgroups: string[];
    groupLabels?: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const DAY_LABEL_FORMAT = "DD MMM";

const StackedBarChart: React.FC<StackedBarChartProps> = ({
    title,
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

    useLayoutEffect(() => {
        if (data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;

            const dataMaxY = Math.max(
                ...data.map(d => {
                    let sum = 0;
                    for (const key of subgroups) {
                        sum += d[key];
                    }
                    return sum;
                })
            );
            const leftMargin = determineGraphLeftPadding(dataMaxY);

            const MARGIN = { top: 30, right: 20, bottom: 50, left: leftMargin };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;
            // reset
            select(theSvg.current).select("*").remove();

            data = timespan !== "all" ? data.slice(-timespan) : data;

            const color = scaleOrdinal<string>().domain(subgroups).range(colors);
            const groups = data.map(d => moment.unix(d.time).format(DAY_LABEL_FORMAT));

            const x = scaleBand().domain(groups)
                .range([0, INNER_WIDTH])
                .paddingInner(0.1);

            const y = scaleLinear().domain([0, dataMaxY])
                .range([INNER_HEIGHT, 0]);

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "none")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            const yAxisGrid = axisLeft(y.nice()).tickFormat(format(d3FormatSpecifier(dataMaxY)));

            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxisGrid);

            const stackedData = stack().keys(subgroups)(data);

            svg.append("g")
                .selectAll("g")
                .data(stackedData)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x(moment.unix(d.data.time).format(DAY_LABEL_FORMAT)) ?? 0)
                .attr("y", d => y(d[1]))
                .attr("class", (_, i) => `rect-${i}`)
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler)
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth());

            const tickValues = timespan === "7" ?
                x.domain() :
                // every third label
                x.domain().filter((_, i) => !(i % 3));
            const xAxis = axisLabelRotate(
                axisBottom(x).tickValues(tickValues)
            );

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                .call(xAxis);
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
            .html(buildTootip(dataPoint.data));
        // add highlight
        const targetClass = (this as SVGRectElement).classList.value;
        select(theSvg.current).selectAll(`.${targetClass}`).attr("class", `${targetClass} hover-highlight`);
    }

    /**
     * Handles mouseout event of a bar "part"
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
        const targetClass = (this as SVGRectElement).classList.value;
        const noHightlight = targetClass.replace("hover-highlight", "").trim();
        select(theSvg.current).selectAll(`.${noHightlight}`).attr("class", noHightlight);
    }

    return (
        <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
            <ChartHeader
                title={title}
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
    title: undefined
};

export default StackedBarChart;

