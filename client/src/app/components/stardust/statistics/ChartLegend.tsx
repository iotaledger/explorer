import { scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import React, { useLayoutEffect, useRef } from "react";
import "./ChartLegend.scss";

interface ChartLegendProps {
    labels: string[];
    colors: string[];
}

const ChartLegend: React.FC<ChartLegendProps> = ({ labels, colors }) => {
    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        const ITEM_HEIGHT = 18;

        const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
        const HEIGHT = ITEM_HEIGHT + MARGIN.top + MARGIN.bottom;


        const color = scaleOrdinal<string>().domain(labels).range(colors);

        const svg = select(theSvg.current)
            .attr("height", HEIGHT)
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const legend = svg.selectAll(".chart-legend__label")
            .data(labels)
            .enter()
            .append("g")
            .attr("class", "chart-legend__label");

        legend.append("circle")
            .attr("cx", 5)
            .attr("cy", 7)
            .attr("r", 7)
            .style("fill", d => color(d));

        legend.append("text")
            .attr("x", 15)
            .attr("y", 12)
            .attr("fill", "#677695")
            .text(d => d);

        const elementWidths: number[] = [];
        legend.each(function fn(d) {
            // eslint-disable-next-line react/no-this-in-sfc, @typescript-eslint/no-invalid-this
            elementWidths.push(this.getBBox().width);
        });

        legend.attr("transform",
            (d, i) => {
                const drawnElements = elementWidths.slice(0, i);
                const x = drawnElements.reduce((a, b) => a + b, 0);
                const xPos = i === 0 ? x : x + (i * 10);
                return `translate(${xPos}, 0)`;
            });

        const WIDTH = (elementWidths.length * 10) +
                elementWidths.reduce((a, b) => a + b, 0);

        select(theSvg.current).attr("width", WIDTH);
    }, [labels, colors]);

    return (
        <div className="chart-legend">
            <svg ref={theSvg} />
        </div>
    );
};

export default ChartLegend;
