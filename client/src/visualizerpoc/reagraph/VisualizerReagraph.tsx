import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { GraphCanvas, GraphCanvasRef } from "reagraph";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useUpdateListener } from "../common/useUpdateListener";
import { useVisualizerReagraph } from "./useVisualizerReagraph";

export const VisualizerReagraph: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
    const refGraph = useRef<GraphCanvasRef>(null);
    const [state, setState] = useState(0);
    // const refNodes = useRef<{}>(null);

    const { onNewBlockData } = useVisualizerReagraph(refGraph);
    const { nodes } = useUpdateListener(network);

    return (
        <>
            <div
                style={{
                    position: "relative",
                    width: 300,
                    height: 300,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "black"
                }}
            >
                <GraphCanvas ref={refGraph} nodes={[]} edges={[]} />
            </div>
            <button
                onClick={() => {
                    refGraph.current?.getGraph().addNode(`${state}`, {});
                    setState(state + 1);
                }}
            >
                click
            </button>
        </>
    );
};

export default VisualizerReagraph;
