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
                <Vivagraph network={network} />
            </Wrapper>
        </GraphProvider>
    );
};

const Vivagraph = ({ network }: {network: string;}) => {
    const graphContext = useContext(GraphContext);
    useFeed(network);

    const { graphElement } = graphContext;

    return (
        <div className="viva" ref={graphElement} />
    );
};

export default VisualizerInstance;
