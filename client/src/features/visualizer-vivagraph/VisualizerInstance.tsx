import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "~app/routes/VisualizerRouteProps";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { Wrapper } from "./components/Wrapper";
import { useFeed } from "~features/visualizer-vivagraph/hooks/useFeed";
import "./Visualizer.scss";

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const themeMode = useGetThemeMode();
    const { graphElement, renderer } = useFeed(network);
    const [isPlaying, setIsPlaying] = React.useState<boolean>(true);

    return (
        <Wrapper
            key={network}
            network={network}
            networkConfig={networkConfig}
            themeMode={themeMode}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            selectedFeedItem={null}
            renderer={renderer}
        >
            <div className="viva" onClick={() => {}} ref={graphElement} />
        </Wrapper>
    );
};

export default VisualizerInstance;
