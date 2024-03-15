import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "~app/routes/VisualizerRouteProps";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { Wrapper } from "./components/Wrapper";
import "./Visualizer.scss";
import { useFeed } from "~features/visualizer-vivagraph/hooks/useFeed";

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const themeMode = useGetThemeMode();
    const { graphElement } = useFeed(network);

    return (
        <Wrapper key={network} network={network} networkConfig={networkConfig} themeMode={themeMode} isPlaying selectedFeedItem={null}>
            <div className="viva" onClick={() => {}} ref={graphElement} />
        </Wrapper>
    );
};

export default VisualizerInstance;
