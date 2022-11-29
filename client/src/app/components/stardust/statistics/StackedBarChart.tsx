import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { stack } from "d3-shape";
import moment from "moment";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import ChartHeader, { TimespanOption } from "./ChartHeader";
import ChartTooltip from "./ChartTooltip";
import "./StackedBarChart.scss";

interface StackedBarChartProps {
    title?: string;
    width: number;
    height: number;
    subgroups: string[];
    colors: string[];
    data: { [name: string]: number; time: number }[];
}

const DAY_LABEL_FORMAT = "DD MMM";

const StackedBarChart: React.FC<StackedBarChartProps> = ({
    title,
    height,
    width,
    subgroups,
    colors,
    data
}) => {
    const theSvg = useRef<SVGSVGElement>(null);
    const theTooltip = useRef<HTMLDivElement>(null);
    const [timespan, setTimespan] = useState<TimespanOption>("7");

    const buildTooltipHtml = useCallback((dataPoint: { [key: string]: number }): string => (
        `
            <p>${moment.unix(dataPoint.time).format("DD-MM-YYYY")}</p>
            ${subgroups.map((subgroup, idx) => (
                `
                    <p>
                        <span class="dot" style="background-color: ${colors[idx]}"></span>
                        <span class="label">${subgroup}: </span>
                        <span class="value">${dataPoint[subgroup]}</span>
                    </p>
                `
            )).join("")}
        `
    ), [subgroups, data]);

    useLayoutEffect(() => {
        const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 };
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

        const svg = select(theSvg.current)
            .attr("width", INNER_WIDTH + MARGIN.left + MARGIN.right)
            .attr("height", INNER_HEIGHT + MARGIN.top + MARGIN.bottom)
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const yAxisGrid = axisLeft(y.nice())
            .ticks(5)
            .tickSize(-INNER_WIDTH)
            .tickPadding(8);
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
            .on("mouseover", (_, d) => {
                select(theTooltip.current)
                    .style("display", "block")
                    .select("#content")
                    .html(buildTooltipHtml(d.data));
            })
            .on("mouseout", () => {
                select(theTooltip.current).style("display", "none");
            })
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        let tickValues = x.domain();
        switch (timespan) {
            case "7":
                break;
            case "30":
                tickValues = x.domain().filter((_, i) => !(i % 3));
                break;
            default:
                tickValues = x.domain().filter((_, i) => !(i % 4));
                break;
        }

        const xAxis = axisBottom(x).tickValues(tickValues);
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0, ${INNER_HEIGHT})`)
            .call(xAxis);
    }, [width, height, data, timespan]);

    return (
        <div className="stack-bar-chart--wrapper">
            <ChartHeader
                title={title}
                legend={{
                    labels: subgroups,
                    colors
                }}
                onTimespanSelected={value => setTimespan(value)}
            />
            <ChartTooltip tooltipRef={theTooltip} />
            <svg className="hook" ref={theSvg} />
        </div>
    );
};

StackedBarChart.defaultProps = {
    title: undefined
};

export default StackedBarChart;

