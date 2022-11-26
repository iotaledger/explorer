import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { stack } from "d3-shape";
import React, { useLayoutEffect, useRef } from "react";
import { BlocksDailyView } from "../../../routes/stardust/statistics/StatisticsPage";
import "./StackedBarChart.scss";

interface StackedBarChartProps {
    width: number;
    height: number;
    data: BlocksDailyView[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ height, width, data }) => {
    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 };
        const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
        const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

        const subgroups = ["transaction", "milestone", "taggedData", "noPayload"];
        const color = scaleOrdinal<string>().domain(subgroups).range(["#73bf69", "#f2cc0d", "#8ab8ff", "#ff780a"]);

        const groups = data.map(d => d.time);

        const x = scaleBand().domain(groups)
            .range([0, INNER_WIDTH])
            .paddingInner(0.1);

        const dataMaxN = max(
            data, d => Math.max(d.transaction ?? 0, d.milestone ?? 0, d.taggedData ?? 0, d.noPayload ?? 0)
        ) ?? 1;

        const y = scaleLinear().domain([0, dataMaxN])
            .range([INNER_HEIGHT, 0]);

        const svg = select(theSvg.current)
            .attr("width", INNER_WIDTH + MARGIN.left + MARGIN.right)
            .attr("height", INNER_HEIGHT + MARGIN.top + MARGIN.bottom)
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const yAxisGrid = axisLeft(y.nice()).tickSize(-INNER_WIDTH).tickPadding(4);
        svg.append("g")
            .attr("class", "axis axis--y")
            .call(yAxisGrid);

        // @ts-expect-error TS complains cause of the time field being a string but its fine
        // as we are accessing only number fields in the stack
        const stackedData = stack().keys(subgroups)(data);

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.time as unknown as string) ?? 0)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        const xAxis = axisBottom(x).tickPadding(10).tickFormat(time => time);
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0, ${INNER_HEIGHT})`)
            .call(xAxis);
    }, [width, height, data]);

    return (
        <div className="multi-bar-chart--wrapper">
            <svg className="hook" ref={theSvg} />
        </div>
    );
};

export default StackedBarChart;
