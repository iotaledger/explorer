import React, { useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { useVisualizerViva } from "./useVisualizerViva";

const VisualizerWebgl: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network }
    }
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const graphElement = useRef<HTMLDivElement | null>(null);

    const {
        setIsPlaying,
        selectNode,
        filter,
        setFilter,
        isPlaying,
        blocksCount,
        selectedFeedItem,
        // isFormatAmountsFull,
        // setIsFormatAmountsFull,
        lastClick
    } = useVisualizerViva(network, graphElement);

    return (
        <Wrapper
            blocksCount={blocksCount}
            filter={filter}
            isPlaying={isPlaying}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={e => setFilter(e.target.value)}
            selectNode={selectNode}
            selectedFeedItem={selectedFeedItem}
            setIsPlaying={setIsPlaying}
        >
            <div
                className="viva"
                onClick={() => {
                    if (lastClick && Date.now() - lastClick > 300) {
                        selectNode();
                    }
                }}
                ref={graphElement}
            />
        </Wrapper>
    );
};
export { VisualizerWebgl };
export default VisualizerWebgl;
