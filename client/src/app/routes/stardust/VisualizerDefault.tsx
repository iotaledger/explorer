import React, { useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useNetworkConfig } from "../../../helpers/hooks/useNetworkConfig";
import { useVisualizerState } from "../../../helpers/hooks/useVisualizerState";
import { Wrapper } from "../../components/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import "./Visualizer.scss";

export const VisualizerDefault: React.FC<RouteComponentProps<VisualizerRouteProps>> = (
    { match: { params: { network } } }
) => {
    const [networkConfig] = useNetworkConfig(network);
    const graphElement = useRef<HTMLDivElement | null>(null);

    const [
        toggleActivity,
        selectNode,
        filter,
        setFilter,
        isActive,
        blocksCount,
        selectedFeedItem,
        isFormatAmountsFull,
        setIsFormatAmountsFull,
        lastClick
    ] = useVisualizerState(network, graphElement);


    return (
        <Wrapper
            blocksCount={blocksCount}
            filter={filter}
            isActive={isActive}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={e => setFilter(e.target.value)}
            selectNode={selectNode}
            selectedFeedItem={selectedFeedItem}
            toggleActivity={toggleActivity}
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

