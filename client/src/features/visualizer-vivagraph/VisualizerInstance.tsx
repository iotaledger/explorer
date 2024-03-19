import React, { useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "~app/routes/VisualizerRouteProps";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { Wrapper } from "./components/Wrapper";
import "./Visualizer.scss";
import { useFeed } from "~features/visualizer-vivagraph/hooks/useFeed";
import { useTangleStore } from "~features/visualizer-vivagraph/store/tangle";
import { GraphContext, GraphProvider } from "./GraphContext";
import Viva from "vivagraphjs";
import { INodeData } from "~models/graph/nova/INodeData";
import { buildNodeShader } from "~features/visualizer-vivagraph/lib/buildNodeShader";

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const selectedFeedItem = useTangleStore((state) => state.selectedNode);
    const [networkConfig] = useNetworkConfig(network);
    const themeMode = useGetThemeMode();

    return (
        <GraphProvider>
            <Wrapper key={network} network={network} networkConfig={networkConfig} themeMode={themeMode} isPlaying selectedFeedItem={selectedFeedItem}>
                <Vivagraph />
            </Wrapper>
        </GraphProvider>
    );
};

const Vivagraph = () => {
    const graphContext = useContext(GraphContext);
    console.log('--- graphContext', graphContext);
    if (!graphContext) {
        return null;
    }

    const { graphElement, graph, graphics } = graphContext;
    console.log('--- ', );

    function setupGraph(): void {
        if (graphElement.current && !graph.current) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.current = Viva.Graph.graph<INodeData, unknown>();
            graphics.current = Viva.Graph.View.webglGraphics<INodeData, unknown>();

            const layout = Viva.Graph.Layout.forceDirected(graph.current, {
                springLength: 10,
                springCoeff: 0.0001,
                stableThreshold: 0.15,
                gravity: -2,
                dragCoeff: 0.02,
                timeStep: 20,
                theta: 0.8,
            });

            graphics.current.setNodeProgram(buildNodeShader());

            const events = Viva.Graph.webglInputEvents(graphics.current, graph.current);

            events.click((node) => selectNode(node));
            events.dblClick((node) => {
                window.open(`${window.location.origin}/${network}/block/${node.id}`, "_blank");
            });

            renderer.current = Viva.Graph.View.renderer<INodeData, unknown>(graph.current, {
                container: graphElement.current,
                graphics: graphics.current,
                layout,
                renderLinks: true,
            });

            renderer.current.run();

            graphics.current.scale(1, { x: graphElement.current.clientWidth / 2, y: graphElement.current.clientHeight / 2 });

            for (let i = 0; i < 12; i++) {
                renderer.current.zoomOut();
            }
        }
    }

    return (
        <div className="viva" ref={graphElement} />
    );
};

export default VisualizerInstance;
