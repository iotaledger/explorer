import { axisBottom, axisLabelRotate } from "@d3fc/d3fc-axis";
import classNames from "classnames";
import { max } from "d3-array";
import { axisLeft } from "d3-axis";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import moment from "moment";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import { noDataView, useChartWrapperSize, useSingleValueTooltip } from "../ChartUtils";
import "./Chart.scss";

interface BarChartProps {
    title?: string;
    data: { [name: string]: number; time: number }[];
    label?: string;
    color: string;
}

const DAY_LABEL_FORMAT = "DD MMM";

const BarChart: React.FC<BarChartProps> = ({ title, data, label, color }) => {
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);
    const theTooltip = useRef<HTMLDivElement>(null);
    const theSvg = useRef<SVGSVGElement>(null);
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

            const x = scaleBand().domain(data.map(d => moment.unix(d.time).format(DAY_LABEL_FORMAT)))
                .range([0, INNER_WIDTH])
                .paddingInner(0.1);

            const dataMaxN = max(data, d => d.n) ?? 1;
            const y = scaleLinear().domain([0, dataMaxN])
                .range([INNER_HEIGHT, 0]);

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMinYMid")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            const yAxisGrid = axisLeft(y.nice())
                .ticks(5)
                .tickSize(-INNER_WIDTH)
                .tickPadding(8);
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxisGrid);

            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(moment.unix(d.time).format(DAY_LABEL_FORMAT)) ?? 0)
                .attr("width", x.bandwidth())
                .attr("y", d => y(d.n))
                .attr("height", d => INNER_HEIGHT - y(d.n))
                .attr("fill", color)
                .on("mouseover", (_, d) => {
                    select(theTooltip.current)
                        .style("display", "block")
                        .select("#content")
                        .html(buildTooltip(d));
                })
                .on("mouseout", () => {
                    select(theTooltip.current).style("display", "none");
                });


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

    return (
        <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
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

BarChart.defaultProps = {
    label: undefined,
    title: undefined
};

export default BarChart;

