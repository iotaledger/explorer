// @ts-nocheck
// import { default as useResizeObserver } from "@react-hook/resize-observer";
import Konva from "konva";
import React, { useEffect, useRef } from "react";

import { Layer, Stage, FastLayer } from "react-konva";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { WorkerNode } from "./entities/Nodes";
import useDimensions from "./hooks/useDimensions";
import { useInit } from "./hooks/useInit";
import { useUpdateListener } from "./hooks/useUpdateListener";
import { useZoom } from "./hooks/useZoom";

import "./worker";

import { ServiceFactory } from "../../factories/serviceFactory";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { Drawer } from "./Drawer";



export const VisualizerCanvas: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
    const [networkConfig] = useNetworkConfig(network);

    const streamOnNewBlock = useRef(null);
    useUpdateListener(network, streamOnNewBlock);

    const onReplay = async () => {
        const feedService = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );

        // await feedService.unsubscribeBlocks();
        feedService.replayAttack((block) => {
            console.log(block);
        });
    };

    return (
        <>
            <button type="button" onClick={onReplay}>
                Replay attack
            </button>
            <Wrapper
                blocksCount={0}
                filter=""
                isActive={false}
                network={network}
                networkConfig={networkConfig}
                onChangeFilter={() => {}}
                selectNode={() => {}}
                selectedFeedItem={null}
                toggleActivity={() => {}}
            >
                <Drawer network={network} refOnNewBlock={streamOnNewBlock} />
            </Wrapper>
        </>
    );
};

export default VisualizerCanvas;
