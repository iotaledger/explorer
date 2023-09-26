import { CameraControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import CanvasContext from "./CanvasContext";

const VisualizerThree: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
        const [networkConfig] = useNetworkConfig(network);

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
                        position={[0, 0, 1]}
                    />
                    <color attach="background" args={["#f2f2f2"]} />
                    <ambientLight />
                    <directionalLight position={[100, 100, 50]} />
                    <CanvasContext network={network} />
                </Canvas>
            </Wrapper>
        );
        // <CameraControls makeDefault />
    };

export default VisualizerThree;
