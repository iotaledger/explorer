import { CameraControls, OrthographicCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";

// import { useElementSize } from "../../shared/hooks/useElementSize";
import { useUpdateListener } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";
import EmitterContext from "./EmitterContext";
import { useBlockStore } from "./store";

const VisualizerThree: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network }
    }
}) => {
    const setDimensions = useBlockStore(s => s.setDimensions);
    const [networkConfig] = useNetworkConfig(network);
    const streamOnNewBlock = useRef<TFeedBlockAdd | null>(null);
    const { setOnNewExists } = useUpdateListener(
        network,
        streamOnNewBlock?.current
    );
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions(width, height);
            }
        });

        resizeObserver.observe(canvas);

        return () => {
            resizeObserver.unobserve(canvas);
            resizeObserver.disconnect();
        };
    }, []);

    const statsEnabled = true;

    return (
        <Wrapper
            blocksCount={0}
            filter=""
            isActive={true}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={() => {}}
            selectNode={() => {}}
            selectedFeedItem={null}
            toggleActivity={() => {}}
        >
            <Canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                }}
            >
                <OrthographicCamera
                    name="mainCamera"
                    makeDefault
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
                {/* {controlsEnabled && <CameraControls makeDefault />} */}
                {statsEnabled && <Stats showPanel={0} className="stats" />}
            </Canvas>
        </Wrapper>
    );
};

export default VisualizerThree;
