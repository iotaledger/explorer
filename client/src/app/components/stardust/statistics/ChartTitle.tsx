import { select } from "d3-selection";
import React, { useLayoutEffect, useRef } from "react";
import "./ChartTitle.scss";

interface ChartTitleProps {
    title: string;
}

const ChartLegend: React.FC<ChartTitleProps> = ({ title }) => {
    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        const ITEM_HEIGHT = 18;

        const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
        const HEIGHT = ITEM_HEIGHT + MARGIN.top + MARGIN.bottom;

        const svg = select(theSvg.current)
            .attr("height", HEIGHT)
            .append("g")
            .attr("transform", `translate(0, ${MARGIN.top})`)
            .append("text")
            .attr("x", MARGIN.left)
            .attr("y", 12)
            .attr("fill", "#677695")
            .text(title);

        let titleWidth: number = 0;
        svg.each(function fn(d) {
            // eslint-disable-next-line react/no-this-in-sfc, @typescript-eslint/no-invalid-this
            titleWidth = this.getBBox().width;
        });

        svg.attr("width", titleWidth + MARGIN.right);
    }, [title]);

    return (
        <div className="chart-title">
            <svg ref={theSvg} />
        </div>
    );
};

export default ChartLegend;
