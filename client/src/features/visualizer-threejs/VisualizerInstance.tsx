/* eslint-disable react/no-unknown-property */
import { Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as THREE from "three";
import {
    FAR_PLANE,
    NEAR_PLANE,
    DIRECTIONAL_LIGHT_INTENSITY,
    PENDING_BLOCK_COLOR,
    VISUALIZER_BACKGROUND,
    BLOCK_STATE_TO_COLOR,
} from "./constants";
import Emitter from "./Emitter";
import { useTangleStore, useConfigStore } from "./store";
import { BPSCounter } from "./BPSCounter";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import { ServiceFactory } from "../../factories/serviceFactory";
import { useNetworkConfig } from "~helpers/hooks/useNetworkConfig";
import { NovaFeedClient } from "../../services/nova/novaFeedClient";
import { Wrapper } from "./wrapper/Wrapper";
import { CanvasElement } from "./enums";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import { TSelectFeedItemNova } from "~/app/types/visualizer.types";
import { BasicBlockBody, IBlockMetadata } from "@iota/sdk-wasm-nova/web";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import CameraControls from "./CameraControls";
import "./Visualizer.scss";
import useVisualizerTimer from "~/helpers/nova/hooks/useVisualizerTimer";
import { getBlockInitPosition, getBlockTargetPosition } from "./blockPositions";

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
    const inView = useConfigStore((s) => s.inView);
    const setInView = useConfigStore((s) => s.setInView);
    const addBlock = useTangleStore((s) => s.addToBlockQueue);
    const addToEdgeQueue = useTangleStore((s) => s.addToEdgeQueue);
    const addToColorQueue = useTangleStore((s) => s.addToColorQueue);
    const blockMetadata = useTangleStore((s) => s.blockMetadata);
    const indexToBlockId = useTangleStore((s) => s.indexToBlockId);
    const clickedInstanceId = useTangleStore((s) => s.clickedInstanceId);

    const selectedFeedItem: TSelectFeedItemNova = clickedInstanceId ? blockMetadata.get(clickedInstanceId) ?? null : null;
    const resetConfigState = useTangleStore((s) => s.resetConfigState);

    const emitterRef = useRef<THREE.Mesh>(null);
    const [feedService, setFeedService] = React.useState<NovaFeedClient | null>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));

    const getCurrentAnimationTime = useVisualizerTimer();

    /**
     * Pause on tab or window change
     */
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                setIsPlaying(false);
                setInView(false);
            } else {
                setInView(true);
            }
        };

        const handleBlur = async () => {
            setIsPlaying(false);
            setInView(false);
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

            feedSubscriptionStart();
        })();
    }, [feedService, runListeners]);

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
            await feedSubscriptionFinalize();
            setFeedService(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));
        })();
    }, [network]);

    useEffect(() => {
        if (!runListeners) {
            return;
        }

        setIsPlaying(true);
        setInView(true);

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

    const feedSubscriptionFinalize = async () => {
        if (!feedService) {
            return;
        }
        await feedService.unsubscribeBlocks();
        bpsCounter.reset();
    };

    /**
     * Subscribe to updates
     * @param blockData The new block data
     */
    const onNewBlock = (blockData: IFeedBlockData) => {
        if (blockData && isPlaying) {
            const currentAnimationTime = getCurrentAnimationTime();
            const bps = bpsCounter.getBPS();
            const initPosition = getBlockInitPosition(currentAnimationTime);
            const targetPosition = getBlockTargetPosition(initPosition, bps);

            bpsCounter.addBlock();

            if (!bpsCounter.getBPS()) {
                bpsCounter.start();
            }

            blockMetadata.set(blockData.blockId, blockData);

            // edges
            const blockStrongParents = (blockData.block.body as BasicBlockBody).strongParents ?? [];
            const blockWeakParents = (blockData.block.body as BasicBlockBody).weakParents ?? [];
            if (blockStrongParents.length > 0) {
                addToEdgeQueue(blockData.blockId, blockStrongParents);
            }
            if (blockWeakParents.length > 0) {
                addToEdgeQueue(blockData.blockId, blockWeakParents);
            }

            addBlock({
                id: blockData.blockId,
                color: PENDING_BLOCK_COLOR,
                targetPosition,
                initPosition,
            });
        }
    };

    function onBlockMetadataUpdate(metadataUpdate: IBlockMetadata): void {
        if (metadataUpdate?.blockState) {
            const selectedColor = BLOCK_STATE_TO_COLOR.get(metadataUpdate.blockState);
            if (selectedColor) {
                addToColorQueue(metadataUpdate.blockId, selectedColor);
            }
        }
    }

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
            selectedFeedItem={selectedFeedItem}
            handlePauseButton={() => {
                setIsPlaying(!isPlaying);
                setInView(!isPlaying);
            }}
            isEdgeRenderingEnabled={isEdgeRenderingEnabled}
            setEdgeRenderingEnabled={(checked) => setEdgeRenderingEnabled(checked)}
        >
            <Canvas
                ref={canvasRef}
                orthographic
                frameloop={inView ? "always" : "never"}
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
