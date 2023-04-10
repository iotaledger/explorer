import classNames from "classnames";
import { scaleOrdinal } from "d3-scale";
import { schemeSet1 } from "d3-scale-chromatic";
import { select } from "d3-selection";
import { arc, pie } from "d3-shape";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { IDistributionEntry } from "../../../../../models/api/stardust/chronicle/ITokenDistributionResponse";
import { noDataView, useChartWrapperSize } from "../ChartUtils";
import "./PieChart.scss";

interface IPieChartProps {
    data: IDistributionEntry[] | null;
}

export const PieChart: React.FC<IPieChartProps> = ({ data }) => {
    const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
    const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
        if (chartWrapper !== null) {
            setTheRef(chartWrapper);
        }
    }, []);
    const theSvg = useRef<SVGSVGElement>(null);

    useLayoutEffect(() => {
        if (data && data.length > 0 && wrapperWidth && wrapperHeight) {
            console.log(data);
            const width = wrapperWidth;
            const height = wrapperHeight;
            const margin = 4;
            // reset
            select(theSvg.current).select("*").remove();
            const radius = (Math.min(width, height) / 2) - margin;

            const svg = select(theSvg.current)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "none")
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);

            const theData = data.map(dp => ({ value: Number(dp.addressCount) }));

            // set the color scale
            const theColor = scaleOrdinal().range(schemeSet1);

            const thePie = pie<{ value: number }>().sort(null).value(d => d.value);
            const dataReady = thePie(theData);

            const theArc = arc<{ value: number }>()
                .innerRadius(radius * 0.4)
                .outerRadius(radius * 0.8);

            const outerArc = arc<{ value: number }>()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);

            svg
                .selectAll("pie-slices")
                .data(dataReady)
                .join("path")
                .attr("d", theArc)
                .attr("fill", d => theColor(d.value.toString(10)) as string)
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .style("opacity", 0.7);

            // Add the polylines between chart and labels:
            svg
                .selectAll("polylines")
                .data(dataReady)
                .join("polyline")
                .attr("stroke", "black")
                .style("fill", "none")
                .attr("stroke-width", 1)
                .attr("points", d => {
                    const posA = theArc.centroid(d);
                    const posB = outerArc.centroid(d);
                    const posC = outerArc.centroid(d);
                    const midangle = d.startAngle + ((d.endAngle - d.startAngle) / 2);
                    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
                    return `${posA[0]},${posA[1]} ${posB[0]},${posB[1]} ${posC[0]},${posC[1]}`;
                });

            // Add the polylines between chart and labels:
            svg
                .selectAll("allLabels")
                .data(dataReady)
                .join("text")
                .text(d => d.value)
                .attr("transform", d => {
                    const pos = outerArc.centroid(d);
                    const midangle = d.startAngle + ((d.endAngle - d.startAngle) / 2);
                    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                    return `translate(${pos})`;
                })
                .style("text-anchor", d => {
                    const midangle = d.startAngle + ((d.endAngle - d.startAngle) / 2);
                    return (midangle < Math.PI ? "start" : "end");
                });
        }
    }, [data, wrapperWidth, wrapperHeight]);

    return (
        <div className={classNames("pie-chart-wrapper", { "chart-wrapper--no-data": data?.length === 0 })}>
            {data?.length === 0 ? (
                noDataView()
            ) : (
                <div className="pie-chart-wrapper__content" ref={chartWrapperRef}>
                    <svg className="hook" ref={theSvg} />
                </div>
            )}
        </div>
    );
};

