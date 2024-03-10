import React, {
    // useEffect,
    useRef,
} from "react";
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
    const { graphElement, itemCount } = useFeed(network);

    return (
        <Wrapper
            key={network}
            blocksCount={itemCount}
            network={network}
            networkConfig={networkConfig}
            selectNode={() => {}}
            selectedFeedItem={null}
            themeMode={themeMode}
            searchValue={""}
            onChangeSearch={(value) => {}}
            isEdgeRenderingEnabled={false}
            setEdgeRenderingEnabled={(checked) => {}}
            isPlaying={false}
            setIsPlaying={() => {}}
        >
            <div className="viva" onClick={() => {}} ref={graphElement} />
        </Wrapper>
    );
};

export default VisualizerInstance;
