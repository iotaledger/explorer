import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import useVisualizerState, { GraphLink, GraphNode } from "../d3/useVisualizerState";


const GraphComponent: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const dagData = useVisualizerState();

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom()
      .scaleExtent([0.5, 10]) // limit the zooming scale between 0.5 to 10 times
      .on("zoom", event => {
        svg.attr("transform", event.transform);
      });

    svg.call(zoom as any);
      // Draw links
      const linkSelection = svg.selectAll(".link")
      .data<GraphLink>(links, (d: any) => `${d.source}-${d.target}`);

    linkSelection.enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", (d: GraphLink) => nodes.find(n => n.id === d.source)?.x ?? 0)
        .attr("y1", (d: GraphLink) => nodes.find(n => n.id === d.source)?.y ?? 0)
        .attr("x2", (d: GraphLink) => nodes.find(n => n.id === d.target)?.x ?? 0)
        .attr("y2", (d: GraphLink) => nodes.find(n => n.id === d.target)?.y ?? 0)
        .attr("stroke", "black");

      // Draw nodes
      const nodeSelection = svg.selectAll(".node")
        .data<GraphNode>(nodes, (d: any) => d.id.toString());

      nodeSelection.enter()
        .append("circle")
        .attr("class", "node")
        .attr("cx", (d: GraphNode) => d.x ?? 0)
        .attr("cy", (d: GraphNode) => d.y ?? 0)
        .attr("r", 5)
        .attr("fill", "blue");
    }
  }, [nodes, links]);

  const addNode = () => {
    // const newNode = { id: nodes.length };
    // setNodes([...nodes, newNode]);
    // setLinks([...links, { source: nodes.length - 1, target: nodes.length }]);
  };

  useEffect(() => {
    setNodes([...dagData.nodes]);
    setLinks([...dagData.links]);
  }, [dagData]);

  return (
      <div>
          <button type="button" onClick={addNode}>Add Node</button>
          <svg ref={svgRef} width="100%" height="100%" />
      </div>
  );
};

export default GraphComponent;
