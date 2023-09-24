import { OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { useUpdateListener } from "../visualizer-canvas/hooks/useUpdateListener";
import BlockMesh from "./BlockMesh";
import { colors } from "./constants";
import { useBlockStore } from "./store";
import { randomIntFromInterval } from "./utils";

const VisualizerThree: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
        const [networkConfig] = useNetworkConfig(network);
        const { blocks, addBlock } = useBlockStore();

        const onNewBlock = (blockData: IFeedBlockData) => {
            addBlock({
                id: blockData.blockId,
                position: [randomIntFromInterval(180, 210), randomIntFromInterval(-50, 50), -10],
                color: colors[randomIntFromInterval(0, colors.length - 1)]
            });
        };
        useUpdateListener(network, onNewBlock);

        return (
            <Wrapper
                blocksCount={0}
                filter=""
                isActive={true}
                network={network}
                networkConfig={networkConfig}
                onChangeFilter={() => { }}
                selectNode={() => { }}
                selectedFeedItem={null}
                toggleActivity={() => { }}
            >
                <Canvas>
                    <OrthographicCamera
                        makeDefault
                        zoom={3}
                        near={1}
                        far={1000}
                        position={[0, 0, 20]}
                    />
                    <color attach="background" args={["#f2f2f2"]} />
                    <ambientLight />
                    <directionalLight position={[100, 100, 50]} />
                    {
                        blocks.map(block => (
                            <BlockMesh
                                key={block.id}
                                id={block.id}
                                position={block.position}
                                color={block.color}
                            />
                        ))
                    }
                </Canvas>
            </Wrapper>
        );
        // <CameraControls makeDefault />
    };

export default VisualizerThree;
