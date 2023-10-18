import { OrthographicCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as THREE from "three";
import { Box3 } from "three";
import { Wrapper } from "../../app/components/stardust/Visualizer/Wrapper";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ServiceFactory } from "../../factories/serviceFactory";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";

import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { colors, ZOOM_DEFAULT } from "./constants";
import Emitter from "./Emitter";
import Spheres from "./Spheres";
import { useBlockStore } from "./store";
import { getGenerateY, randomIntFromInterval, timer } from "./utils";

const features = {
    statsEnabled: true
};

const timerDiff = timer(250);

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network }
    }
}) => {
    const setDimensions = useBlockStore(s => s.setDimensions);
    const [networkConfig] = useNetworkConfig(network);
    const generateY = getGenerateY({ withRandom: true });

    const [runListeners, setRunListeners] = React.useState<boolean>(false);

    // Note: to prevent rerender each store update - call methods separate.
    const addBlock = useBlockStore(s => s.addBlock);
    const addParents = useBlockStore(s => s.addParents);
    const addYPosition = useBlockStore(s => s.addYPosition);
    const checkZoom = useBlockStore(s => s.checkZoom);
    const setIsPlaying = useBlockStore(s => s.setIsPlaying);
    const isPlaying = useBlockStore(s => s.isPlaying);

    const emitterRef = useRef<THREE.Mesh>(null);
    const feedServiceRef = useRef<StardustFeedClient | null>(null);

    /**
     * Control play/pause
     */
    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            if (!runListeners || !feedServiceRef?.current) {
                return;
            }

            if (isPlaying) {
                feedServiceRef.current.subscribeBlocks(onNewBlock, () => {});
                setIsPlaying(true);
            } else {
                await feedServiceRef.current.unsubscribeBlocks();
                setIsPlaying(false);
            }
        })();
    }, [feedServiceRef?.current, isPlaying, runListeners]);

    /**
     * Control width and height of canvas
     */
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


    /**
     * Subscribe to updates
     * @param blockData
     */
    const onNewBlock = (blockData: IFeedBlockData) => {
        const emitterObj = emitterRef.current;
        if (emitterObj && blockData) {
            const emitterBox = new Box3().setFromObject(emitterObj);
            const secondsFromStart = timerDiff();

            const Y = generateY(secondsFromStart);

            const position: [number, number, number] = [
                randomIntFromInterval(emitterBox.min.x, emitterBox.max.x),
                Y,
                randomIntFromInterval(emitterBox.min.z, emitterBox.max.z)
            ];

            addBlock({
                id: blockData.blockId,
                position
            }, {
                color: colors[randomIntFromInterval(0, colors.length - 1)],
                scale: 1
            });
            addParents(blockData.blockId, blockData.parents ?? []);
            addYPosition(Y);
            checkZoom();
        }
    };

    useEffect(() => {
        if (!runListeners) {
            return;
        }
        feedServiceRef.current = ServiceFactory.get<StardustFeedClient>(
            `feed-${network}`
        );
        setIsPlaying(true);
    }, [runListeners]);

    return (
        <Wrapper
            blocksCount={0}
            filter=""
            isPlaying={isPlaying}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={() => {}}
            selectNode={() => {}}
            selectedFeedItem={null}
            setIsPlaying={setIsPlaying}
        >
            <Canvas
                ref={canvasRef}
            >
                <OrthographicCamera
                    name="mainCamera"
                    makeDefault
                    near={1}
                    far={4000}
                    position={[0, 0, 1500]}
                    zoom={ZOOM_DEFAULT}
                />
                <color attach="background" args={["#f2f2f2"]} />
                <ambientLight />
                <directionalLight position={[100, 100, 50]} />
                <Emitter emitterRef={emitterRef} setRunListeners={setRunListeners} />
                <Spheres />
                {/* {controlsEnabled && <CameraControls makeDefault />} */}
                {features.statsEnabled && <Stats showPanel={0} className="stats" />}
            </Canvas>
        </Wrapper>
    );
};

export default VisualizerInstance;
