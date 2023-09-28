// @ts-nocheck
// import { default as useResizeObserver } from "@react-hook/resize-observer";
import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ServiceFactory } from "../../factories/serviceFactory";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { Drawer } from "./Drawer";
import { useUpdateListener } from "./hooks/useUpdateListener";

export const VisualizerCanvas: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const [ui, setUi] = useState<"stream" | "replayAttack">("stream");

    const streamOnNewBlock = useRef(null);
    const replayAttackOnNewBlock = useRef(null);
    useUpdateListener(network, streamOnNewBlock);

    const onReplay = async () => {
        const feedService = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );
        setUi("replayAttack");

        // await feedService.unsubscribeBlocks();
        feedService.replayAttack((block) => {

            const blockMock = {
                "blockId": new Date().getTime(),
                "value": 800000000,
                "parents": [],
                "properties": {
                    "transactionId": "0x7fd851a18b58dfe6d306dea4a0a3c92d070df4a940768496a6f749954c018858"
                },
                "payloadType": "Transaction",
            };

            replayAttackOnNewBlock.current(blockMock);
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
                <Drawer
                    isVisible={ui === "stream"}
                    network={network}
                    refOnNewBlock={streamOnNewBlock}
                />
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1000,
                    display: ui === "replayAttack" ? "block" : "none"
                }}
                >
                    <Drawer
                        isVisible={ui === "replayAttack"}
                        network={network}
                        refOnNewBlock={replayAttackOnNewBlock}
                    />
                </div>
            </Wrapper>
        </>
    );
};

export default VisualizerCanvas;
