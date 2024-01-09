import classNames from "classnames";
import { brushX, D3BrushEvent } from "d3-brush";
import { scaleTime, scaleLinear, scaleOrdinal, NumberValue } from "d3-scale";
import { BaseType, select } from "d3-selection";
import { area, line, SeriesPoint, stack } from "d3-shape";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { ModalData } from "../../../ModalProps";
import ChartHeader from "../ChartHeader";
import ChartTooltip from "../ChartTooltip";
import {
  buildXAxis,
  buildYAxis,
  computeDataIncludedInSelection,
  computeHalfLineWidth,
  determineGraphLeftPadding,
  noDataView,
  timestampToDate,
  TRANSITIONS_DURATION_MS,
  useChartWrapperSize,
  useMultiValueTooltip,
  useTouchMoveEffect,
} from "../ChartUtils";
import "./Chart.scss";

interface StackedLineChartProps {
  readonly chartId: string;
  readonly title?: string;
  readonly info?: ModalData;
  readonly subgroups: string[];
  readonly groupLabels?: string[];
  readonly colors: string[];
  readonly data: { [name: string]: number; time: number }[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({ chartId, title, info, subgroups, groupLabels, colors, data }) => {
  const [{ wrapperWidth, wrapperHeight }, setTheRef] = useChartWrapperSize();
  const chartWrapperRef = useCallback((chartWrapper: HTMLDivElement) => {
    if (chartWrapper !== null) {
      setTheRef(chartWrapper);
    }
  }, []);
  const theSvg = useRef<SVGSVGElement>(null);
  const theTooltip = useRef<HTMLDivElement>(null);
  const buildTootip = useMultiValueTooltip(data, subgroups, colors, groupLabels);

  useTouchMoveEffect(mouseoutHandler);

  useLayoutEffect(() => {
    if (data.length > 0 && wrapperWidth && wrapperHeight) {
      const width = wrapperWidth;
      const height = wrapperHeight;
      // reset
      select(theSvg.current).selectAll("*").remove();

      // chart dimensions
      const yMax = Math.max(...data.map((d) => Math.max(...subgroups.map((key) => d[key]))));
      const leftMargin = determineGraphLeftPadding(yMax);
      const MARGIN = { top: 30, right: 20, bottom: 50, left: leftMargin };
      const INNER_WIDTH = width - MARGIN.left - MARGIN.right;
      const INNER_HEIGHT = height - MARGIN.top - MARGIN.bottom;

      const color = scaleOrdinal<string>().domain(subgroups).range(colors);

      const stackedData = stack().keys(subgroups)(data);
      const groups = data.map((d) => timestampToDate(d.time));

      // SVG
      const svg = select(theSvg.current)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "none")
        .append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      // X
      const x = scaleTime()
        .domain([groups[0], groups.at(-1) ?? groups[0]])
        .range([0, INNER_WIDTH]);

      const xAxisSelection = svg
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0, ${INNER_HEIGHT})`)
        .call(buildXAxis(x));

      // Y
      const y = scaleLinear().domain([0, yMax]).range([INNER_HEIGHT, 0]);
      const yAxisSelection = svg.append("g").attr("class", "axis axis--y").call(buildYAxis(y, yMax));

      // clip path
      svg
        .append("defs")
        .append("clipPath")
        .attr("id", `clip-${chartId}`)
        .append("rect")
        .attr("width", INNER_WIDTH)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

      // area fill
      const areaGen = area<SeriesPoint<{ [key: string]: number }>>()
        .x((d) => x(timestampToDate(d.data.time)) ?? 0)
        .y0((_) => y(0))
        .y1((d) => y(d[1] - d[0]));

      const theArea = svg.append("g").attr("class", "areas").attr("clip-path", `url(#clip-${chartId})`);

      const areaSelection = theArea
        .selectAll("g")
        .data(stackedData)
        .join("path")
        .style("fill", (d) => getGradient(d.key, color(d.key)))
        .attr("opacity", 0.5)
        .attr("class", "area")
        .attr("d", areaGen);

      // area lines path
      const lineGen = line<SeriesPoint<{ [key: string]: number }>>()
        .x((d) => x(timestampToDate(d.data.time)) ?? 0)
        .y((d) => y(d[1] - d[0]));

      const lineSelection = svg
        .append("g")
        .attr("class", "lines")
        .attr("clip-path", `url(#clip-${chartId})`)
        .selectAll("g")
        .data(stackedData)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", (d) => color(d.key))
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("d", lineGen);

      const attachOnHoverLinesAndCircles = () => {
        svg.selectAll(".hover-circles").remove();
        svg.selectAll(".hover-lines").remove();

        const halfLineWidth = computeHalfLineWidth(data, x);
        for (const dataStack of stackedData) {
          svg
            .append("g")
            .attr("class", "hover-circles")
            .attr("clip-path", `url(#clip-${chartId})`)
            .selectAll("g")
            .data(dataStack)
            .enter()
            .append("circle")
            .attr("fill", color(dataStack.key))
            .style("stroke", color(dataStack.key))
            .style("stroke-width", 5)
            .style("stroke-opacity", 0)
            .attr("cx", (d) => x(timestampToDate(d.data.time)) ?? 0)
            .attr("cy", (d) => y(d[1] - d[0]))
            .attr("r", 0)
            .attr("class", (_, i) => `circle-${i}`);
        }

        // hover lines for tooltip
        svg
          .append("g")
          .attr("class", "hover-lines")
          .attr("clip-path", `url(#clip-${chartId})`)
          .selectAll("g")
          .data(data)
          .enter()
          .append("rect")
          .attr("fill", "transparent")
          .attr("x", (_, idx) => (idx === 0 ? 0 : (x(timestampToDate(data[idx].time)) ?? 0) - halfLineWidth))
          .attr("y", 0)
          .attr("class", (_, i) => `rect-${i}`)
          .attr("height", INNER_HEIGHT)
          .attr("width", (_, idx) => (idx === 0 || idx === data.length - 1 ? halfLineWidth : halfLineWidth * 2))
          .on("mouseover", mouseoverHandler)
          .on("mouseout", mouseoutHandler);
      };

      // brushing
      const brush = brushX()
        .extent([
          [0, 0],
          [INNER_WIDTH, height],
        ])
        .on("end", (e) => onBrushHandler(e as D3BrushEvent<{ [key: string]: number }>));

      const brushSelection = svg.append("g").attr("class", "brush").call(brush);

      let idleTimeout: NodeJS.Timer | null = null;
      const idled = () => {
        idleTimeout = null;
      };
      const onBrushHandler = (event: D3BrushEvent<{ [key: string]: number }>) => {
        if (!event.selection) {
          return;
        }
        const extent = event.selection;
        if (extent) {
          x.domain([x.invert(extent[0] as NumberValue), x.invert(extent[1] as NumberValue)]);
          // eslint-disable-next-line @typescript-eslint/unbound-method
          brushSelection.call(brush.move, null);
        } else {
          if (!idleTimeout) {
            idleTimeout = setTimeout(idled, 350);
            return idleTimeout;
          }
          x.domain([groups[0], groups.at(-1) ?? groups[0]]);
        }

        const selectedData = computeDataIncludedInSelection(x, data);

        // to prevent infinite brushing
        if (selectedData.length > 1) {
          const yMaxUpdate = Math.max(...selectedData.map((d) => Math.max(...subgroups.map((key) => d[key]))));
          y.domain([0, yMaxUpdate]);
          // Update axis
          yAxisSelection.transition().duration(TRANSITIONS_DURATION_MS).call(buildYAxis(y, yMaxUpdate));
          xAxisSelection.transition().duration(TRANSITIONS_DURATION_MS).call(buildXAxis(x));
          // Update area and lines
          areaSelection.transition().duration(TRANSITIONS_DURATION_MS).attr("d", areaGen);
          lineSelection.transition().duration(TRANSITIONS_DURATION_MS).attr("d", lineGen);
          // rebuild the hover activated lines & cicles
          attachOnHoverLinesAndCircles();
        }
      };

      // double click reset
      svg.on("dblclick", () => {
        x.domain([groups[0], groups.at(-1) ?? groups[0]]);
        xAxisSelection.transition().call(buildXAxis(x));
        y.domain([0, yMax]);
        yAxisSelection.transition().duration(TRANSITIONS_DURATION_MS).call(buildYAxis(y, yMax));
        areaSelection.transition().duration(TRANSITIONS_DURATION_MS).attr("d", areaGen);
        lineSelection.transition().duration(TRANSITIONS_DURATION_MS).attr("d", lineGen);

        attachOnHoverLinesAndCircles();
      });

      attachOnHoverLinesAndCircles();
    }
  }, [data, wrapperWidth, wrapperHeight]);

  /**
   * Get linear gradient for selected color
   * @param id The id for the gradient element
   * @param color The color for the gradient
   * @returns The gradient
   */
  function getGradient(id: string, color: string): string {
    const areaGradient = select(theSvg.current)
      .append("defs")
      .append("linearGradient")
      .attr("id", `aG-${id}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    areaGradient.append("stop").attr("offset", "30%").attr("stop-color", color).attr("stop-opacity", 0.6);

    areaGradient.append("stop").attr("offset", "90%").attr("stop-color", "white").attr("stop-opacity", 0);

    return `url(#aG-${id})`;
  }

  /**
   * Handles mouseover event.
   * @param this The mouse hovered element
   * @param _ The unused event param
   * @param dataPoint The data point rendered by this rect
   */
  function mouseoverHandler(this: SVGRectElement | BaseType, _: MouseEvent, dataPoint: { [key: string]: number }) {
    // show tooltip
    select(theTooltip.current).style("display", "block").select("#content").html(buildTootip(dataPoint));
    // add highlight
    const eleClass = (this as SVGRectElement).classList[0];
    const idx = eleClass.slice(eleClass.indexOf("-") + 1);
    select(theSvg.current).selectAll(`.circle-${idx}`).attr("r", 2).style("stroke-opacity", 0.5);

    select(this).classed("active", true);
  }

  /**
   * Handles mouseout event.
   */
  function mouseoutHandler() {
    // remove tooltip
    select(theTooltip.current).style("display", "none");
    // remove highlight
    const activeElement = select(theSvg.current).select(".active");
    if (activeElement.size() > 0) {
      const elClass = activeElement.attr("class");
      const idx = elClass.slice(elClass.indexOf("rect-") + 5, elClass.lastIndexOf(" "));

      select(theSvg.current).selectAll(`.circle-${idx}`).attr("r", 0).style("stroke-opacity", 0);

      activeElement.classed("active", false);
    }
  }

  return (
    <div className={classNames("chart-wrapper", { "chart-wrapper--no-data": data.length === 0 })}>
      <ChartHeader
        title={title}
        info={info}
        legend={{
          labels: groupLabels ?? subgroups,
          colors,
        }}
        disabled={data.length === 0}
      />
      {data.length === 0 ?
        noDataView()
      : <div className="chart-wrapper__content" ref={chartWrapperRef}>
          <ChartTooltip tooltipRef={theTooltip} />
          <svg className="hook" ref={theSvg} />
        </div>
      }
    </div>
  );
};

StackedLineChart.defaultProps = {
  groupLabels: undefined,
  info: undefined,
  title: undefined,
};

export default StackedLineChart;
