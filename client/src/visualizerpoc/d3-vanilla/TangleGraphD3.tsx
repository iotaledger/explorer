import { dagStratify, sugiyama, DagNode } from "d3-dag";
import React, { useEffect, useRef } from "react";
import useVisualizerState, { GraphNode } from "./useVisualizerState";

const TangleGraphD3: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dagData = useVisualizerState();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && dagData.length > 0) {
      const layout = sugiyama()
        .size([500, 500]);

      const dag = dagStratify()(dagData);

      layout(dag);

      const context = canvasRef.current.getContext("2d");

      if (context) {
        context.clearRect(0, 0, 500, 500);

        dag.descendants().forEach((node: DagNode<GraphNode, undefined>) => {
          const { x, y } = node;
          const { id } = node.data;

          context.beginPath();
          context.arc(y ?? 0, x ?? 0, 20, 0, 2 * Math.PI, false);
          context.fillStyle = "lightgrey";
          context.fill();
          context.lineWidth = 1;
          context.strokeStyle = "#000";
          context.stroke();
          context.fillStyle = "#000";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(id, y ?? 0, x ?? 0);
        });

        dag.links().forEach(({ source, target }) => {
          context.beginPath();
          context.moveTo(source.y ?? 0, source.x ?? 0);
          context.lineTo(target.y ?? 0, target.x ?? 0);
          context.lineWidth = 1;
          context.strokeStyle = "#000";
          context.stroke();
        });
      }
    }
  }, [dagData]);

  return (
      <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: "1px solid black" }}
      />
  );
};

export default TangleGraphD3;
