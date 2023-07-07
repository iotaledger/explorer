import Konva from "konva";
import React, { useRef, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import regl from "regl";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { useUpdateListener } from "../common/useUpdateListener";

export const VisualizerWebglD3: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
    const [nodes, setNodes] = useState<{ id: string; x: number; y: number }[]>(
        []
    );
    const canvasRef = useRef(null);

    const onNewBlock = (block: IFeedBlockData) => {
        // here is my code
        // Extract blockId from the incoming block
        const { blockId } = block;

        // Generate coordinates for the node
        // In a real application, you would likely calculate these values based on your needs
        const newNode = {
            id: blockId,
            x: Math.random() * 2 - 1, // generate random value between -1 and 1
            y: Math.random() * 2 - 1 // generate random value between -1 and 1
        };
        // Append the new node to the existing set of nodes
        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    const [networkConfig] = useNetworkConfig(network);

    useUpdateListener(network, onNewBlock);

    useEffect(() => {
        console.log("--- nodes", nodes);
        if (canvasRef.current) {
            const reglInstance = regl({ canvas: canvasRef.current });
            const drawPoints = reglInstance({
                frag: `
                  precision mediump float;
                  void main () {
                    gl_FragColor = vec4(0, 1, 0, 1);  // Set the point color
                  }
                `,
                vert: `
                  precision mediump float;
                  attribute vec2 position;
                  void main () {
                    gl_PointSize = 1.0;  // Set the point size
                    gl_Position = vec4(position, 0, 1);
                  }
                `,
                attributes: {
                    // @ts-expect-error type never
                    position: reglInstance.prop("position")
                },
                // @ts-expect-error type never
                count: reglInstance.prop("count"),
                primitive: "points"
            });

            const positions = nodes.map((node) => [node.x, node.y]);

            drawPoints({
                position: positions,
                count: positions.length
            });
        }
    }, [nodes]);

    return (
        <Wrapper
            blocksCount={0}
            filter=""
            isActive={false}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={() => {}}
            selectNode={() => {}}
            selectedFeedItem={null}
            toggleActivity={() => {}}
        >
            <canvas
                style={{ border: 1, borderStyle: "solid", width: "100%" }}
                className="visualizer-webgl-d3"
                ref={canvasRef}
            />
        </Wrapper>
    );
};
