/* eslint-disable react/no-unknown-property */
import { Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as THREE from "three";
import { Box3 } from "three";
import { ACCEPTED_BLOCK_COLORS, DIRECTIONAL_LIGHT_INTENSITY, FAR_PLANE, NEAR_PLANE, PENDING_BLOCK_COLOR, TIME_DIFF_COUNTER, VISUALIZER_BACKGROUND } from "./constants";
import Emitter from "./Emitter";
import { useTangleStore, useConfigStore } from "./store";
import { getGenerateY, randomIntFromInterval, timer } from "./utils";
import { BPSCounter } from "./BPSCounter";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ServiceFactory } from "../../factories/serviceFactory";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { NovaFeedClient } from "../../services/nova/novaFeedClient";
import { Wrapper } from "./wrapper/Wrapper";
import "./Visualizer.scss";
import { IFeedBlockMetadata } from "~/models/api/stardust/feed/IFeedBlockMetadata";
import { CanvasElement } from './enums';
import { useGetThemeMode } from '~/helpers/hooks/useGetThemeMode';
import { StardustFeedClient } from "~/services/stardust/stardustFeedClient";
import CameraControls from './CameraControls';

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
    const themeMode = useGetThemeMode()

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
    const addToEdgeQueue = useTangleStore(s => s.addToEdgeQueue);
    const addToColorQueue = useTangleStore(s => s.addToColorQueue);
    const addYPosition = useTangleStore(s => s.addYPosition);
    const blockMetadata = useTangleStore(s => s.blockMetadata);
    const indexToBlockId = useTangleStore(s => s.indexToBlockId);

    const emitterRef = useRef<THREE.Mesh>(null);
    const feedServiceRef = useRef<StardustFeedClient | NovaFeedClient | null>(null);

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

            const targetPosition = {
                x: randomIntFromInterval(emitterBox.min.x, emitterBox.max.x),
                y: Y,
                z: randomIntFromInterval(emitterBox.min.z, emitterBox.max.z),
            };

            bpsCounter.addBlock();
            if (!bpsCounter.getBPS()) {
                bpsCounter.start();
            }

            blockMetadata.set(blockData.blockId, blockData);

            addToEdgeQueue(blockData.blockId, blockData.parents ?? []);
            addYPosition(Y);

            const emitterCenter = new THREE.Vector3();
            emitterBox.getCenter(emitterCenter);

            addBlock({
                id: blockData.blockId,
                color: PENDING_BLOCK_COLOR,
                targetPosition: {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z
                },
                initPosition: {
                    x: emitterCenter.x,
                    y: emitterCenter.y,
                    z: emitterCenter.z
                }
            });
        }
    };

    function onBlockMetadataUpdate(metadataUpdate: { [id: string]: IFeedBlockMetadata }): void {
        for (const [blockId, metadata] of Object.entries(metadataUpdate)) {
            if (metadata.referenced && !metadata.conflicting) {
                const colorIndex = randomIntFromInterval(0, ACCEPTED_BLOCK_COLORS.length - 1);
                addToColorQueue(blockId, ACCEPTED_BLOCK_COLORS[colorIndex]);
            }
        }
    }
    useEffect(() => {
        if (!runListeners) {
            return;
        }
        feedServiceRef.current = ServiceFactory.get<NovaFeedClient | StardustFeedClient>(
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
        feedServiceRef.current.subscribeBlocks(onNewBlock, onBlockMetadataUpdate);
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
            <Canvas ref={canvasRef} orthographic camera={{
                name: CanvasElement.MainCamera,
                near: NEAR_PLANE,
                far: FAR_PLANE,
                position: [0, 0, 9000],
            }}>
                <color attach="background" args={[VISUALIZER_BACKGROUND[themeMode]]} />
                <ambientLight />
                <directionalLight position={[400, 700, 920]} intensity={DIRECTIONAL_LIGHT_INTENSITY} />
                <Center>
                    <Emitter
                        emitterRef={emitterRef}
                        setRunListeners={setRunListeners}
                        />
                </Center>
                {features.cameraControls && <CameraControls />}
                {features.statsEnabled && <Perf />}
            </Canvas>
        </Wrapper>
    );
};

export default VisualizerInstance;

