import { axisBottom, axisLabelRotate } from "@d3fc/d3fc-axis";
import classNames from "classnames";
import { axisLeft } from "d3-axis";
import { format } from "d3-format";
import { scaleBand, scaleLinear } from "d3-scale";
import { BaseType, select } from "d3-selection";
import React, { useCallback, useContext, useLayoutEffect, useRef } from "react";
import { isShimmerUiTheme } from "../../../../../helpers/networkHelper";
import { IDistributionEntry } from "../../../../../models/api/stardust/chronicle/ITokenDistributionResponse";
import NetworkContext from "../../../../context/NetworkContext";
import ChartTooltip from "../ChartTooltip";
import { d3FormatSpecifier, getSubunitThreshold, noDataView, useChartWrapperSize, useTokenDistributionTooltip } from "../ChartUtils";
import "./RangeBarChart.scss";

interface IRangeBarChartProps {
    data: IDistributionEntry[] | null;
    yField: "addressCount" | "totalBalance";
    yLabel: string;
}

export const RangeBarChart: React.FC<IRangeBarChartProps> = ({ data, yField, yLabel }) => {
    const { tokenInfo, uiTheme } = useContext(NetworkContext);
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);
    const theTooltip = useRef<HTMLDivElement>(null);
    const theSvg = useRef<SVGSVGElement>(null);
    const subunitThreshold = getSubunitThreshold(tokenInfo) ?? null;
    const buildTooltip = useTokenDistributionTooltip(data, tokenInfo);

    const isShimmerUi = isShimmerUiTheme(uiTheme);

    useLayoutEffect(() => {
        if (data && data.length > 0 && wrapperWidth && wrapperHeight && subunitThreshold) {
            // reset
            select(theSvg.current).select("*").remove();

            const width = wrapperWidth;
            const height = wrapperHeight;
            // data dependent vars
            const dataY = yField === "addressCount" ?
                data.map(d => Number(d[yField])) :
                data.map(d => Number(d[yField]) / subunitThreshold);
            const dataMaxY = Math.max(...dataY);
            const leftMargin = width < 600 ? 50 : 60;
            const rangeLabel = (range: { start: number; end: number }) => {
                const start = format(d3FormatSpecifier(range.start / subunitThreshold))(range.start / subunitThreshold);
                const end = format(d3FormatSpecifier(range.end / subunitThreshold))(range.end / subunitThreshold);
                return `${start} - ${end}`;
            };
            const ranges = data.map(d => rangeLabel(d.range));

            const MARGIN = { top: 20, right: 20, bottom: 60, left: leftMargin };
            const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
            const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "none")
                .append("g")
                .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

            const x = scaleBand().domain(ranges)
                .range([0, INNER_WIDTH])
                .paddingInner(0.2);

            const y = scaleLinear()
                .domain([0, dataMaxY])
                .range([INNER_HEIGHT, 0]);

            // x axis
            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${INNER_HEIGHT})`)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                .call(axisLabelRotate(axisBottom(x)));

            // x axis label
            svg.append("text")
                .attr("class", "axis-x-label")
                .attr("text-anchor", "middle")
                .attr("x", INNER_WIDTH / 2)
                .attr("y", INNER_HEIGHT + (width < 350 ? 12 : 50))
                .text(`${tokenInfo.unit} HELD RANGE`);

            // y axis
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(axisLeft(y.nice()).tickFormat(format(d3FormatSpecifier(dataMaxY))));

            // y axis label
            svg.append("text")
                .attr("class", "axis-y-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -(INNER_HEIGHT / 2))
                .attr("y", width < 600 ? -36 : -46)
                .text(yLabel);

            // bars
            svg.selectAll("rect")
                .data(data)
                .join("rect")
                .attr("class", "bar")
                .attr("x", d => x(rangeLabel(d.range)) ?? 0)
                .attr("width", x.bandwidth())
                .attr("y", d => y(
                    yField === "addressCount" ?
                        Number(d[yField]) :
                        Number(d[yField]) / subunitThreshold
                ))
                .attr("rx", 2)
                .attr("height", d => INNER_HEIGHT - y(
                    yField === "addressCount" ?
                        Number(d[yField]) :
                        Number(d[yField]) / subunitThreshold
                ))
                .style("fill", isShimmerUi ? "#14CABF" : "#3ca2ff");

            // hidden hover areas
            svg.append("g")
                .attr("class", "hover-lines")
                .selectAll("g")
                .data(data)
                .enter()
                .append("rect")
                .attr("fill", "transparent")
                .attr("x", d => x(rangeLabel(d.range)) ?? 0)
                .attr("y", 0)
                .attr("class", (_, i) => `rect rect-${i}`)
                .attr("rx", 3)
                .attr("height", INNER_HEIGHT)
                .attr("width", x.bandwidth())
                .on("mouseover", mouseoverHandler)
                .on("mouseout", mouseoutHandler);
        }
    }, [data, wrapperWidth, wrapperHeight]);

    /**
     * Handles mouseover event of a bar "part"
     * @param this The mouse hovered element
     * @param _ The unused event param
     * @param dataPoint The distribution entry
     */
    function mouseoverHandler(
        this: SVGRectElement | BaseType,
        _: unknown,
        dataPoint: IDistributionEntry
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
        <div className={classNames("range-chart-wrapper", { "chart-wrapper--no-data": data?.length === 0 })}>
            {data?.length === 0 ? (
                noDataView()
            ) : (
                <div className="range-chart-wrapper__content" ref={chartWrapperRef}>
                    <ChartTooltip tooltipRef={theTooltip} />
                    <svg className="hook" ref={theSvg} />
                </div>
            )}
        </div>
    );
};

