/* eslint-disable react/no-unknown-property */
import { CameraControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as THREE from "three";
import { Box3 } from "three";
import { COLORS, TIME_DIFF_COUNTER, ZOOM_DEFAULT } from "./constants";
import Emitter from "./Emitter";
import { useTangleStore, useConfigStore } from "./store";
import { getGenerateY, randomIntFromInterval, timer } from "./utils";
import { BPSCounter } from "./BPSCounter";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ServiceFactory } from "../../factories/serviceFactory";
import { useNetworkConfig } from "../../helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { Wrapper } from "./wrapper/Wrapper";
import "./Visualizer.scss";

const features = {
    statsEnabled: true,
    cameraControls: true
};

const timerDiff = timer(TIME_DIFF_COUNTER);

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network }
    }
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const generateY = getGenerateY({ withRandom: true });

    const [runListeners, setRunListeners] = React.useState<boolean>(false);

    const setBps = useTangleStore(s => s.setBps);
    const [bpsCounter] = React.useState(new BPSCounter(bps => {
        setBps(bps);
    }));

    // Note: to prevent rerender each store update - call methods separate.
    const isEdgeRenderingEnabled = useConfigStore(s => s.isEdgeRenderingEnabled);
    const setEdgeRenderingEnabled = useConfigStore(s => s.setEdgeRenderingEnabled);
    const setDimensions = useConfigStore(s => s.setDimensions);
    const isPlaying = useConfigStore(s => s.isPlaying);
    const setIsPlaying = useConfigStore(s => s.setIsPlaying);
    const addBlock = useTangleStore(s => s.addToBlockQueue);
    const addToScaleQueue = useTangleStore(s => s.addToScaleQueue);
    const addToEdgeQueue = useTangleStore(s => s.addToEdgeQueue);
    const addYPosition = useTangleStore(s => s.addYPosition);
    const blockIdToPosition = useTangleStore(s => s.blockIdToPosition);
    const blockMetadata = useTangleStore(s => s.blockMetadata);
    const indexToBlockId = useTangleStore(s => s.indexToBlockId);

    const emitterRef = useRef<THREE.Mesh>(null);
    const feedServiceRef = useRef<StardustFeedClient | null>(null);

    /**
     * Pause on tab or window change
     */
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                return feedSubscriptionStop();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", feedSubscriptionStop);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", feedSubscriptionStop);
        };
    }, []);

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
                feedSubscriptionStart();
            } else {
                await feedSubscriptionStop();
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
     * @param blockData The new block data
     */
    const onNewBlock = (blockData: IFeedBlockData) => {
        const emitterObj = emitterRef.current;
        if (emitterObj && blockData) {
            const emitterBox = new Box3().setFromObject(emitterObj);
            const secondsFromStart = timerDiff();

            const Y = generateY(secondsFromStart, bpsCounter.getBPS());

            const position: [number, number, number] = [
                randomIntFromInterval(emitterBox.min.x, emitterBox.max.x),
                Y,
                randomIntFromInterval(emitterBox.min.z, emitterBox.max.z)
            ];

            bpsCounter.addBlock();
            if (!bpsCounter.getBPS()) {
                bpsCounter.start();
            }

            addBlock({
                id: blockData.blockId,
                position,
                color: COLORS[randomIntFromInterval(0, COLORS.length - 1)]
            });

            blockIdToPosition.set(blockData.blockId, position);
            blockMetadata.set(blockData.blockId, blockData);

            addToScaleQueue(blockData.blockId, blockData.parents ?? []);
            addToEdgeQueue(blockData.blockId, blockData.parents ?? []);
            addYPosition(Y);
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

        return () => {
            bpsCounter.stop();
        };
    }, [runListeners]);

    const feedSubscriptionStart = () => {
        if (!feedServiceRef.current) {
            return;
        }
        feedServiceRef.current.subscribeBlocks(onNewBlock, () => { });
        bpsCounter.start();
        setIsPlaying(true);
    };

    const feedSubscriptionStop = async () => {
        if (!feedServiceRef.current) {
            return;
        }
        await feedServiceRef.current.unsubscribeBlocks();
        bpsCounter.stop();
        setIsPlaying(false);
    };

    return (
        <Wrapper
            blocksCount={indexToBlockId.length}
            filter=""
            isPlaying={isPlaying}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={() => { }}
            selectNode={() => { }}
            selectedFeedItem={null}
            setIsPlaying={setIsPlaying}
            isEdgeRenderingEnabled={isEdgeRenderingEnabled}
            setEdgeRenderingEnabled={checked => setEdgeRenderingEnabled(checked)}
        >
            <Canvas ref={canvasRef}>
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
                <Emitter
                    emitterRef={emitterRef}
                    setRunListeners={setRunListeners}
                />
                {features.cameraControls && <CameraControls makeDefault />}
                {features.statsEnabled && <Perf />}
            </Canvas>
        </Wrapper>
    );
};

export default VisualizerInstance;
