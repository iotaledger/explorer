import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import moment from "moment";
import React, { useLayoutEffect, useRef } from "react";
import "./BarChart.scss";

interface BarChartProps {
    width: number;
    height: number;
    data: { [name: string]: number; time: number }[];
}

const DAY_LABEL_FORMAT = "DD MMM";

const BarChart: React.FC<BarChartProps> = ({ height, width, data }) => {
    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 };
        const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
        const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

        const x = scaleBand().domain(data.map(d => moment.unix(d.time).format(DAY_LABEL_FORMAT)))
            .range([0, INNER_WIDTH])
            .paddingInner(0.1);

        const dataMaxN = max(data, d => d.n) ?? 1;
        const y = scaleLinear().domain([0, dataMaxN])
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

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(moment.unix(d.time).format(DAY_LABEL_FORMAT)) ?? 0)
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.n))
            .attr("height", d => INNER_HEIGHT - y(d.n))
            .attr("fill", "#14cabf");

        const xAxis = axisBottom(x).tickPadding(10).tickFormat(time => time);
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0, ${INNER_HEIGHT})`)
            .call(xAxis);
    }, [width, height, data]);

    return (
        <div className="bar-chart--wrapper">
            <svg className="hook" ref={theSvg} />
        </div>
    );
};

export default BarChart;

