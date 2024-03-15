import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "~app/routes/VisualizerRouteProps";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { Wrapper } from "./components/Wrapper";
import "./Visualizer.scss";
import { useFeed } from "~features/visualizer-vivagraph/hooks/useFeed";
import { useTangleStore } from "~features/visualizer-vivagraph/store/tangle";

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const selectedFeedItem = useTangleStore((state) => state.selectedNode);
    const [networkConfig] = useNetworkConfig(network);
    const themeMode = useGetThemeMode();
    const { graphElement } = useFeed(network);

    return (
        <Wrapper key={network} network={network} networkConfig={networkConfig} themeMode={themeMode} isPlaying selectedFeedItem={selectedFeedItem}>
            <div className="viva" onClick={() => {}} ref={graphElement} />
        </Wrapper>
    );
};

export default VisualizerInstance;
