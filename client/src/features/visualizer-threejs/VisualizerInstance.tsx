/* eslint-disable react/no-unknown-property */
import { Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as THREE from "three";
import { Box3 } from "three";
import {
    FAR_PLANE,
    NEAR_PLANE,
    ACCEPTED_BLOCK_COLORS,
    DIRECTIONAL_LIGHT_INTENSITY,
    PENDING_BLOCK_COLOR,
    VISUALIZER_BACKGROUND,
    EMITTER_X_POSITION_MULTIPLIER,
} from "./constants";
import Emitter from "./Emitter";
import { useTangleStore, useConfigStore } from "./store";
import { getGenerateDynamicYZPosition, randomIntFromInterval } from "./utils";
import { BPSCounter } from "./BPSCounter";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ServiceFactory } from "../../factories/serviceFactory";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { NovaFeedClient } from "../../services/nova/novaFeedClient";
import { Wrapper } from "./wrapper/Wrapper";
import "./Visualizer.scss";
import { IFeedBlockMetadata } from "~/models/api/stardust/feed/IFeedBlockMetadata";
import { CanvasElement } from "./enums";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import { StardustFeedClient } from "~/services/stardust/stardustFeedClient";
import CameraControls from "./CameraControls";

const features = {
    statsEnabled: true,
    cameraControls: true,
};

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const generateYZPositions = getGenerateDynamicYZPosition();
    const themeMode = useGetThemeMode();

    const [runListeners, setRunListeners] = React.useState<boolean>(false);

    const setBps = useTangleStore((s) => s.setBps);
    const [bpsCounter] = React.useState(
        new BPSCounter((bps) => {
            setBps(bps);
        }),
    );

    // Note: to prevent rerender each store update - call methods separate.
    const isEdgeRenderingEnabled = useConfigStore((s) => s.isEdgeRenderingEnabled);
    const setEdgeRenderingEnabled = useConfigStore((s) => s.setEdgeRenderingEnabled);
    const setDimensions = useConfigStore((s) => s.setDimensions);
    const isPlaying = useConfigStore((s) => s.isPlaying);
    const setIsPlaying = useConfigStore((s) => s.setIsPlaying);
    const addBlock = useTangleStore((s) => s.addToBlockQueue);
    const addToEdgeQueue = useTangleStore((s) => s.addToEdgeQueue);
    const addToColorQueue = useTangleStore((s) => s.addToColorQueue);
    const blockMetadata = useTangleStore((s) => s.blockMetadata);
    const indexToBlockId = useTangleStore((s) => s.indexToBlockId);
    const resetConfigState = useTangleStore((s) => s.resetConfigState);

    const [feedService, setFeedService] = React.useState<StardustFeedClient | NovaFeedClient | null>(
        ServiceFactory.get<NovaFeedClient | StardustFeedClient>(`feed-${network}`),
    );
    const emitterRef = useRef<THREE.Mesh>(null);

    /**
     * Pause on tab or window change
     */
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                await feedSubscriptionStop();
                setIsPlaying(false);
            }
        };

        const handleBlur = async () => {
            await feedSubscriptionStop();
            setIsPlaying(false);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    useEffect(() => {
        return () => {
            setRunListeners(false);
            setIsPlaying(false);
            resetConfigState();
            feedService?.unsubscribeBlocks();
        };
    }, []);

    /**
     * Control play/pause
     */
    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            if (!runListeners || !feedService) {
                return;
            }

            if (isPlaying) {
                feedSubscriptionStart();
            } else {
                await feedSubscriptionStop();
            }
        })();
    }, [feedService, isPlaying, runListeners]);

    /**
     * Control width and height of canvas
     */
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
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

    useEffect(() => {
        (async () => {
            setRunListeners(false);
            setIsPlaying(false);
            resetConfigState();
            await feedSubscriptionStop();
            setFeedService(ServiceFactory.get<NovaFeedClient | StardustFeedClient>(`feed-${network}`));
        })();
    }, [network]);

    /**
     * Subscribe to updates
     * @param blockData The new block data
     */
    const onNewBlock = (blockData: IFeedBlockData) => {
        const emitterObj = emitterRef.current;
        if (emitterObj && blockData) {
            const emitterBox = new Box3().setFromObject(emitterObj);

            const emitterCenter = new THREE.Vector3();
            emitterBox.getCenter(emitterCenter);

            const { y, z } = generateYZPositions(bpsCounter.getBPS(), emitterCenter);
            const minX = emitterBox.min.x - (emitterBox.max.x - emitterBox.min.x) * EMITTER_X_POSITION_MULTIPLIER;
            const maxX = emitterBox.max.x + (emitterBox.max.x - emitterBox.min.x) * EMITTER_X_POSITION_MULTIPLIER;

            const x = randomIntFromInterval(minX, maxX);
            const targetPosition = { x, y, z };

            bpsCounter.addBlock();
            if (!bpsCounter.getBPS()) {
                bpsCounter.start();
            }

            blockMetadata.set(blockData.blockId, blockData);

            addToEdgeQueue(blockData.blockId, blockData.parents ?? []);

            addBlock({
                id: blockData.blockId,
                color: PENDING_BLOCK_COLOR,
                targetPosition,
                initPosition: {
                    x: emitterCenter.x,
                    y: emitterCenter.y,
                    z: emitterCenter.z,
                },
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
        setIsPlaying(true);

        return () => {
            bpsCounter.stop();
        };
    }, [runListeners]);

    const feedSubscriptionStart = () => {
        if (!feedService) {
            return;
        }
        feedService.subscribeBlocks(onNewBlock, onBlockMetadataUpdate);
        bpsCounter.start();
    };

    const feedSubscriptionStop = async () => {
        if (!feedService) {
            return;
        }
        await feedService.unsubscribeBlocks();
        bpsCounter.reset();
    };

    return (
        <Wrapper
            key={network}
            blocksCount={indexToBlockId.length}
            filter=""
            isPlaying={isPlaying}
            network={network}
            networkConfig={networkConfig}
            onChangeFilter={() => {}}
            selectNode={() => {}}
            selectedFeedItem={null}
            setIsPlaying={setIsPlaying}
            isEdgeRenderingEnabled={isEdgeRenderingEnabled}
            setEdgeRenderingEnabled={(checked) => setEdgeRenderingEnabled(checked)}
        >
            <Canvas
                ref={canvasRef}
                orthographic
                camera={{
                    name: CanvasElement.MainCamera,
                    near: NEAR_PLANE,
                    far: FAR_PLANE,
                    position: [0, 0, 9000],
                }}
            >
                <color attach="background" args={[VISUALIZER_BACKGROUND[themeMode]]} />
                <ambientLight />
                <directionalLight position={[400, 700, 920]} intensity={DIRECTIONAL_LIGHT_INTENSITY} />
                <Center>
                    <Emitter emitterRef={emitterRef} setRunListeners={setRunListeners} />
                </Center>
                {features.cameraControls && <CameraControls />}
                {features.statsEnabled && <Perf />}
            </Canvas>
        </Wrapper>
    );
};

export default VisualizerInstance;
