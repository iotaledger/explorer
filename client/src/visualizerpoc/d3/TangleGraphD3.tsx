import * as d3 from "d3-force";
import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import useVisualizerState, { GraphLink, GraphNode } from "./useVisualizerState";

interface TangleGraphD3Props {
  onItemSelected: (feedItem: IFeedBlockData) => void;
  startAttack?: boolean;
}

const TangleGraphD3: React.FC<TangleGraphD3Props> = ({ onItemSelected, startAttack }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any | null>(null);
  const graphData = useVisualizerState(startAttack);
  const [userInteracted, setUserInteracted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<GraphLink[]>([]);

  const EDGE_COLOR_CONFIRMING: string = "#FF5AAA";
  const EDGE_COLOR_CONFIRMED_BY: string = "#0000FF";
  const COLOR_PENDING: string = "#bbbbbb";
  const COLOR_REFERENCED: string = "#61e884";
  const COLOR_CONFLICTING: string = "#ff8b5c";
  const COLOR_INCLUDED: string = "#4caaff";
  const COLOR_MILESTONE: string = "#666af6";
  const COLOR_SEARCH_RESULT: string = "#C061E8";
  const COLOR_SELECTED = "green";


  useEffect(() => {
    if (fgRef?.current && !userInteracted) {
      // Move camera to follow the nodes
      const latestNode = graphData.nodes[graphData.nodes.length - 1];
      fgRef.current.centerAt(latestNode?.x, 0, 1000);
    }
  }, [graphData]);

  // On node click, update the selected node
  const handleNodeClick = (node: GraphNode) => {
    setUserInteracted(true);
    setSelectedNode(node);
    if (node.data) {
      onItemSelected(node.data);
    }
    // const connectedLinks = graphData.links.filter(link => link.source === node.id || link.target === node.id);
    // setSelectedLinks(connectedLinks);
};

const nodeColor = (node: GraphNode) => {
  let color = COLOR_PENDING; // Default node color

  // Logic for initial node color
  if (node.data?.metadata?.milestone) {
    color = COLOR_MILESTONE;
  } else if (node.data?.metadata?.conflicting) {
    color = COLOR_CONFLICTING;
  } else if (node.data?.metadata?.included) {
    color = COLOR_INCLUDED;
  } else if (node.data?.metadata?.referenced) {
    color = COLOR_REFERENCED;
  }

  if (node === selectedNode) {
    color = COLOR_SELECTED; // Highlight color for selected node
  } else if (selectedNode) {
    // console.log("hass SELECTED NODE", graphData.links)
    if (graphData.links.find(link => link.target === node.id)) {
      console.log("found edge link")
      color = EDGE_COLOR_CONFIRMED_BY; // Color for child node
    } else if (graphData.links.find(link => link.source === node.id)) {
      color = EDGE_COLOR_CONFIRMING; // Color for parent node
    }
  }

  // console.log(color)
  return color;
};

const linkColor = (link: GraphLink) => {
  let color = COLOR_PENDING; // Default link color

  if (selectedNode) {
    if (selectedLinks.find(l => l === link)) {
      if (link.target === selectedNode.id) {
        color = EDGE_COLOR_CONFIRMED_BY; // Color for link to child node
      } else if (link.source === selectedNode.id) {
        color = EDGE_COLOR_CONFIRMING; // Color for link to parent node
      }
    }
  }
  return color;
};
  return (
      <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="id"
          nodeColor={nodeColor}
          linkColor={linkColor}
          // dagMode="td"
          // dagLevelDistance={300}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          d3VelocityDecay={0.3}
          warmupTicks={30}
          cooldownTicks={Number.POSITIVE_INFINITY}
          cooldownTime={5000}
          onNodeClick={(node: GraphNode, event: MouseEvent) => {
            console.log("NODE CLICK", node);
            handleNodeClick(node);
          }}
          onLinkClick={(link: GraphLink, event: MouseEvent) => {
            console.log("link CLICK", link);
            setUserInteracted(true);
          }}
          onBackgroundClick={(event: MouseEvent) => {
            console.log("background CLICK");
            setUserInteracted(true);
            setSelectedNode(null);
          }}
          // nodeCanvasObject={(node, ctx) => {
          //   ctx.beginPath();
          //   ctx.arc(node.x ?? 0, node.y ?? 0, 5, 0, 2 * Math.PI, false);
          //   ctx.fillStyle = nodeColor(node);
          //   ctx.fill();
          // }}
          // linkCanvasObject={(link, ctx) => {
          //   const source = link.source as GraphNode;
          //   const target = link.target as GraphNode;
          //   console.log()
          //   if (source.x && source.y && target.x && target.y) {
          //     // console.log("setting coclor")
          //     ctx.beginPath();
          //     ctx.moveTo(source.x, source.y);
          //     ctx.lineTo(target.x, target.y);
          //     ctx.strokeStyle = linkColor(link);
          //     ctx.stroke();
          //   }
          // }}
      />
  );
};

TangleGraphD3.defaultProps = {
  startAttack: false
};
export default TangleGraphD3;
