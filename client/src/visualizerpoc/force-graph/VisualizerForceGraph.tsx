import React, { useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import {
    MAX_ITEMS,
    FEED_PROBE_THRESHOLD,
    EDGE_COLOR_LIGHT,
    EDGE_COLOR_DARK,
    EDGE_COLOR_CONFIRMING,
    EDGE_COLOR_CONFIRMED_BY,
    COLOR_PENDING,
    COLOR_REFERENCED,
    COLOR_CONFLICTING,
    COLOR_INCLUDED,
    COLOR_MILESTONE,
    COLOR_SEARCH_RESULT
} from "../../helpers/hooks/useVisualizerState";
import { useVisualizerForceGraph } from "./useVisualizerForceGraph";

const VisualizerForceGraph: React.FC<RouteComponentProps<VisualizerRouteProps>> = (
    { match: { params: { network } } }
) => {
    const [networkConfig] = useNetworkConfig(network);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graphElement = useRef<any | null>(null);

    const {
        toggleActivity,
        selectNode,
        filter,
        setFilter,
        isActive,
        blocksCount,
        selectedFeedItem,
        // isFormatAmountsFull,
        // setIsFormatAmountsFull,
        lastClick,
        graphData
    } = useVisualizerForceGraph(network, graphElement);

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

            <ForceGraph2D
                ref={graphElement}
                cooldownTicks={0}
                graphData={graphData}
                // graphData={{ nodes: [...Array.from({ length: 5 }).keys()].map(i => ({ id: i })), links: [{ target: 1, source: 2 }] }}
                // d3VelocityDecay={0.5}
                // d3AlphaMin={0.05}
            />
            {/* <div */}
            {/*     className="force-graph" */}
            {/*     ref={graphElement} */}
            {/* /> */}
        </Wrapper>
    );
};
export { VisualizerForceGraph };
export default VisualizerForceGraph;
