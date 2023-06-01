import * as d3 from "d3";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import React, { useEffect, useRef } from "react";

// Define Node interface
interface Node extends SimulationNodeDatum {
  id: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Link extends SimulationLinkDatum<Node> {}

const Graph: React.FC = () => {
  const ref = useRef<SVGSVGElement>(null);
  const nodesData = useRef<Node[]>([]);
  const linksData = useRef<Link[]>([]);


  useEffect(() => {
    nodesData.current = Array.from({ length: 10 }, (_, i) => ({ id: `${i}` }));

    // Create an array of links where each link connects node i to node i + 1
    linksData.current = Array.from({ length: nodesData.current.length - 1 }, (_, i) => ({
      source: nodesData.current[i],
      target: nodesData.current[i + 1]
    }));

    if (ref.current) {
      const svg = d3.select(ref.current);

      const simulation = d3.forceSimulation(nodesData.current)
        .force("link", d3.forceLink(linksData.current).id((d: d3.SimulationNodeDatum) => (d as Node).id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(250, 250));

      const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(linksData.current)
        .join("line")
        .style("stroke", "black");

      const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodesData.current)
        .join("circle")
        .attr("r", 10)
        .attr("fill", "blue");

      // Update link and node positions at every step of the simulation
      simulation.on("tick", () => {
        link
          .attr("x1", d => (d.source as Node).x!)
          .attr("y1", d => (d.source as Node).y!)
          .attr("x2", d => (d.target as Node).x!)
          .attr("y2", d => (d.target as Node).y!);
          
        node
          .attr("cx", d => d.x!)
          .attr("cy", d => d.y!);
      });

      const update = () => {
        console.log("in update", nodesData.current, linksData.current)
        let linkSelection = svg.selectAll<SVGLineElement, Link>("line.links")
            .data(linksData.current, (d: any) => d.id);

        const linkEnter = linkSelection.enter().append("line")
            .attr("class", "links");

        linkSelection = linkEnter.merge(linkSelection);

        linkSelection
            .attr("x1", d => (d.source as Node).x!)
            .attr("y1", d => (d.source as Node).y!)
            .attr("x2", d => (d.target as Node).x!)
            .attr("y2", d => (d.target as Node).y!);


        linkSelection.exit().remove();

        let nodeSelection = svg.selectAll<SVGCircleElement, Node>("circle.nodes")
        .data(nodesData.current, (d: any) => d.id);

        const nodeEnter = nodeSelection.enter().append("circle")
            .attr("class", "nodes")
            .attr("r", 12)
            .attr("cx", (d: any) => d.x)
            .attr("cy", (d: any) => d.y);

        nodeSelection = nodeEnter.merge(nodeSelection);

        simulation.nodes(nodesData.current);
        const linkForce = simulation.force("link");

        if (linkForce) {
            (linkForce as d3.ForceLink<Node, Link>).links(linksData.current);
        } else {
            console.error("Link force is not defined in the simulation.");
        }
        simulation.alpha(1).restart();
      };

      d3.select("#update1").on("click", () => {
        const sourceNodeId = Math.floor(Math.random() * (nodesData.current.length - 1));
        const newNodeId = nodesData.current.length;
        linksData.current.push({
          "source": sourceNodeId.toString(), "target": newNodeId.toString()
        });

        nodesData.current.push({
          "id": newNodeId.toString()
        });
        update();
      });
    }
  }, []);

  return (
      <div>
        <svg ref={ref} width={1000} height={800} />
        <button id="update1">Add node</button>
      </div>
  );
};

export default Graph;
