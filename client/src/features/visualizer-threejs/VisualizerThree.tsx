import { CameraControls, OrthographicCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import CanvasContext from "./CanvasContext";
import EmitterContext from "./EmitterContext";

import { useUpdateListener, UpdateListenerReturn } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";

const VisualizerThree: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
        const [networkConfig] = useNetworkConfig(network);
        const streamOnNewBlock = useRef<TFeedBlockAdd | null>(null);
        const replayAttackOnNewBlock = useRef(null);

        // @ts-ignore
        const { setOnNewExists } = useUpdateListener(network, streamOnNewBlock?.current);

        const controlsEnabled = true;
        const statsEnabled = true;

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
                        near={0.1}
                        far={4000}
                        position={[0, 0, 200]}
                    />
                    <color attach="background" args={["#f2f2f2"]} />
                    <ambientLight />
                    <directionalLight position={[100, 100, 50]} />
                    <EmitterContext network={network} />
                    <CanvasContext
                        network={network}
                        refOnNewBlock={streamOnNewBlock}
                        setOnNewExists={setOnNewExists}
                    />
                    {controlsEnabled && <CameraControls makeDefault />}
                    {statsEnabled && <Stats showPanel={0} className="stats" />}
                </Canvas>
            </Wrapper>
        );
    };

export default VisualizerThree;
