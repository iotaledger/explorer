import { CameraControls, OrthographicCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";

import { useUpdateListener } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";
import EmitterContext from "./EmitterContext";
import { useBlockStore } from "./store";

const VisualizerThree: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = ({
    match: {
        params: { network }
    }
}) => {
        const [networkConfig] = useNetworkConfig(network);
        const streamOnNewBlock = useRef<TFeedBlockAdd | null>(null);
        // @ts-ignore
        const { setOnNewExists } = useUpdateListener(network, streamOnNewBlock?.current);
        const camera = useRef<THREE.OrthographicCamera>(null);
    // @ts-ignore
        const canvasRef = useRef<any>(null);
        const controlsEnabled = true;
        const statsEnabled = true;


        useEffect(() => {
            if (camera?.current) {
                // @ts-ignore
                window.camera = camera.current;
                // @ts-ignore
                window.canvasRef = canvasRef.current;
                setTimeout(() => {
                    if (!camera.current) return;
                    console.log('--- test');
                    camera.current.zoom = 1;
                    camera.current.updateProjectionMatrix();
                    // camera.current.zoom = 2;
                }, 1000);
                camera.current.updateProjectionMatrix();
            }
        }, [camera?.current]);

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
                <Canvas ref={canvasRef}>
                    <OrthographicCamera
                        ref={camera}
                        makeDefault
                        zoom={3}
                        near={1}
                        far={4000}
                        position={[0, 0, 200]}
                    />
                    <color attach="background" args={["#f2f2f2"]} />
                    <ambientLight />
                    <directionalLight position={[100, 100, 50]} />
                    <EmitterContext
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
