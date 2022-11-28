import { schemeSet2 } from "d3";
import { scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import React, { useLayoutEffect, useRef } from "react";
import "./ChartLegend.scss";

interface ChartLegendProps {
    labels: string[];
}

const ChartLegend: React.FC<ChartLegendProps> = ({ labels }) => {
    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        const ITEM_WIDTH = 80;
        const ITEM_HEIGHT = 18;
        const ITEM_NUMBER = labels.length;

        const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
        const WIDTH = (ITEM_NUMBER * ITEM_WIDTH) + MARGIN.left + MARGIN.right;
        const HEIGHT = ITEM_HEIGHT + MARGIN.top + MARGIN.bottom;

        const color = scaleOrdinal()
            .domain(labels)
            .range(schemeSet2);

        const svg = select(theSvg.current)
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const legend = svg.selectAll(".chart-legend__label")
            .data(labels)
            .enter()
            .append("g")
            .attr("transform",
                (d, i) => `translate(${i % ITEM_NUMBER * ITEM_WIDTH}, ${Math.floor(i / ITEM_NUMBER) * ITEM_HEIGHT})`)
            .attr("class", "chart-legend__label");

        legend.append("circle")
            .attr("cx", 5)
            .attr("cy", 7)
            .attr("r", 7)
            .style("fill", d => color(d) as string);

        legend.append("text")
            .attr("x", 15)
            .attr("y", 12)
            .attr("fill", "#677695")
            .text(d => d);
    }, [labels]);

    return (
        <div className="chart-legend">
            <svg ref={theSvg} />
        </div>
    );
};

export default ChartLegend;
