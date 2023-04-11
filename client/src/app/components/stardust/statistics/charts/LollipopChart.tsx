import classNames from "classnames";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import React, { useCallback, useContext, useLayoutEffect, useRef } from "react";
import { formatAmount } from "../../../../../helpers/stardust/valueFormatHelper";
import { IDistributionEntry } from "../../../../../models/api/stardust/chronicle/ITokenDistributionResponse";
import NetworkContext from "../../../../context/NetworkContext";
import { noDataView, useChartWrapperSize } from "../ChartUtils";
import "./LollipopChart.scss";

interface ILollipopChartProps {
    data: IDistributionEntry[] | null;
}

export const LollipopChart: React.FC<ILollipopChartProps> = ({ data }) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);

    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        if (data && data.length > 0 && wrapperWidth && wrapperHeight) {
            const width = wrapperWidth;
            const height = wrapperHeight;
            // reset
            select(theSvg.current).select("*").remove();
            const dataMaxX = Math.max(...data.map(d => Number(d.addressCount)));

            const MARGIN = { top: 30, right: 20, bottom: 50, left: 200 };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "none")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            const x = scaleLinear()
                .domain([0, dataMaxX])
                .range([0, INNER_WIDTH]);

            svg.append("g")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                .call(axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

            const buildYLabel = (range: { start: number; end: number }) => {
                const start = formatAmount(range.start, tokenInfo);
                const end = formatAmount(range.end, tokenInfo);
                return `${start} to ${end}`;
            };

            const y = scaleBand()
                .range([0, INNER_HEIGHT])
                .domain(data.map(d => buildYLabel(d.range)))
                .padding(1);

            svg.append("g")
                .call(axisLeft(y));

            svg.selectAll("lines")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", d => x(Number(d.addressCount)))
                .attr("x2", x(0))
                .attr("y1", d => y(buildYLabel(d.range)) ?? null)
                .attr("y2", d => y(buildYLabel(d.range)) ?? null)
                .attr("stroke", "black");

            svg.selectAll("circles")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => x(Number(d.addressCount)))
                .attr("cy", d => y(buildYLabel(d.range)) ?? null)
                .attr("r", "4")
                .style("fill", "#00e0ca")
                .attr("stroke", "black");

            svg.selectAll("address-counts")
                .data(data)
                .enter()
                .append("text")
                .attr("x", d => Math.max(x(Number(d.addressCount)) - 30, 7))
                .attr("y", d => (y(buildYLabel(d.range)) ?? 0) - 10)
                .text(d => d.addressCount);
        }
    }, [data, wrapperWidth, wrapperHeight]);

    return (
        <div className={classNames("lollipop-chart-wrapper", { "chart-wrapper--no-data": data?.length === 0 })}>
            {data?.length === 0 ? (
                noDataView()
            ) : (
                <div className="lollipop-chart-wrapper__content" ref={chartWrapperRef}>
                    <svg className="hook" ref={theSvg} />
                </div>
            )}
        </div>
    );
};
