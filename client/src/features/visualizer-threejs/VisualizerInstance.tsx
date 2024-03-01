/* eslint-disable react/no-unknown-property */
import { Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls, folder } from "leva";
import { Perf } from "r3f-perf";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as THREE from "three";
import { FAR_PLANE, features, NEAR_PLANE, DIRECTIONAL_LIGHT_INTENSITY, VISUALIZER_BACKGROUND } from "./constants";
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
import { BasicBlockBody, Utils, type IBlockMetadata, type BlockState, type SlotIndex } from "@iota/sdk-wasm-nova/web";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import CameraControls from "./CameraControls";
import useVisualizerTimer from "~/helpers/nova/hooks/useVisualizerTimer";
import { getBlockInitPosition, getBlockTargetPosition } from "./blockPositions";
import { getBlockColorByState, getCurrentTiltValue } from "./utils";
import useSearchStore from "~features/visualizer-threejs/store/search";
import { useSearch } from "~features/visualizer-threejs/hooks/useSearch";
import "./Visualizer.scss";

const VisualizerInstance: React.FC<RouteComponentProps<VisualizerRouteProps>> = ({
    match: {
        params: { network },
    },
}) => {
    const [networkConfig] = useNetworkConfig(network);
    const themeMode = useGetThemeMode();
    const getCurrentAnimationTime = useVisualizerTimer();

    const [runListeners, setRunListeners] = React.useState<boolean>(false);

    const { cameraXShift, azimuthAngle } = useControls("CameraControls", {
        transform: folder({
            cameraXShift: { value: 0, min: -10000, max: 10000, step: 20, label: "X: Shift" },
            azimuthAngle: { value: 0, min: -1, max: 1, step: 0.005, label: "X: Rotate" },
        }),
    });

    const setBps = useTangleStore((s) => s.setBps);
    const [bpsCounter] = React.useState(
        new BPSCounter((bps) => {
            setBps(bps);
        }),
    );

    const { isSearchMatch, highlightSearchBlock } = useSearch();

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
    const clickedInstanceId = useTangleStore((s) => s.clickedInstanceId);
    const matchingBlockIds = useSearchStore((state) => state.matchingBlockIds);

    const blockIdToState = useTangleStore((s) => s.blockIdToState);
    const setBlockIdToBlockState = useTangleStore((s) => s.setBlockIdToBlockState);

    // Confirmed or accepted blocks by slot
    const confirmedBlocksBySlot = useTangleStore((s) => s.confirmedBlocksBySlot);
    const addToConfirmedBlocksSlot = useTangleStore((s) => s.addToConfirmedBlocksBySlot);
    const removeConfirmedBlocksSlot = useTangleStore((s) => s.removeConfirmedBlocksSlot);

    const sinusoidPeriodsSum = useConfigStore((s) => s.sinusoidPeriodsSum);
    const sinusoidRandomPeriods = useConfigStore((s) => s.sinusoidRandomPeriods);
    const sinusoidRandomAmplitudes = useConfigStore((s) => s.randomSinusoidAmplitudes);
    const randomTilts = useConfigStore((state) => state.randomTilts);

    const selectedFeedItem: TSelectFeedItemNova = clickedInstanceId ? blockMetadata.get(clickedInstanceId) ?? null : null;
    const resetConfigState = useTangleStore((s) => s.resetConfigState);

    const emitterRef = useRef<THREE.Mesh>(null);
    const [feedService, setFeedService] = React.useState<NovaFeedClient | null>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));

    /**
     * Pause on tab or window change
     */
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                setIsPlaying(false);
            }
        };

        const handleBlur = async () => {
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

        return () => {
            bpsCounter.stop();
        };
    }, [runListeners]);

    const feedSubscriptionStart = () => {
        if (!feedService) {
            return;
        }
        feedService.subscribeBlocks(onNewBlock, onBlockMetadataUpdate, onSlotFinalized);

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
        if (blockData) {
            const currentAnimationTime = getCurrentAnimationTime();
            const bps = bpsCounter.getBPS();
            const initPosition = getBlockInitPosition({
                currentAnimationTime,
                periods: sinusoidRandomPeriods,
                periodsSum: sinusoidPeriodsSum,
                sinusoidAmplitudes: sinusoidRandomAmplitudes,
            });
            const blockTiltFactor = getCurrentTiltValue(currentAnimationTime, randomTilts);
            const targetPosition = getBlockTargetPosition(initPosition, bps, blockTiltFactor);

            bpsCounter.addBlock();

            if (!bpsCounter.getBPS()) {
                bpsCounter.start();
            }

            const blockColor = getBlockColorByState(themeMode, "pending");
            blockMetadata.set(blockData.blockId, { ...blockData, treeColor: blockColor });

            // edges
            const blockStrongParents = (blockData.block.body as BasicBlockBody).strongParents ?? [];
            const blockWeakParents = (blockData.block.body as BasicBlockBody).weakParents ?? [];
            if (blockStrongParents.length > 0) {
                addToEdgeQueue(blockData.blockId, blockStrongParents);
            }
            if (blockWeakParents.length > 0) {
                addToEdgeQueue(blockData.blockId, blockWeakParents);
            }

            if (isSearchMatch(blockData)) {
                highlightSearchBlock(blockData.blockId);
            }

            setBlockIdToBlockState(blockData.blockId, "pending");

            addBlock({
                id: blockData.blockId,
                color: blockColor,
                blockAddedTimestamp: currentAnimationTime,
                targetPosition,
                initPosition,
            });
        }
    };

    function onBlockMetadataUpdate(metadataUpdate: IBlockMetadata): void {
        if (metadataUpdate?.blockState) {
            const selectedColor = getBlockColorByState(themeMode, metadataUpdate.blockState);
            if (selectedColor) {
                const currentBlockMetadata = blockMetadata.get(metadataUpdate.blockId);
                if (currentBlockMetadata) {
                    currentBlockMetadata.treeColor = selectedColor;
                }

                const previousBlockState = blockIdToState.get(metadataUpdate.blockId);
                const wasConfirmedBeforeAccepted = previousBlockState === "accepted" && metadataUpdate.blockState === "confirmed";

                if (!wasConfirmedBeforeAccepted) {
                    setBlockIdToBlockState(metadataUpdate.blockId, metadataUpdate.blockState);
                    if (!matchingBlockIds.includes(metadataUpdate.blockId)) {
                        addToColorQueue(metadataUpdate.blockId, selectedColor);
                    }
                }

                const acceptedStates: BlockState[] = ["confirmed", "accepted"];

                if (acceptedStates.includes(metadataUpdate.blockState)) {
                    const slot = Utils.computeSlotIndex(metadataUpdate.blockId);
                    addToConfirmedBlocksSlot(metadataUpdate.blockId, slot);
                }
            }
        }
    }

    function onSlotFinalized(slot: SlotIndex): void {
        const blocks = confirmedBlocksBySlot.get(slot);

        if (blocks?.length) {
            blocks.forEach((blockId) => {
                const selectedColor = getBlockColorByState(themeMode, "finalized");
                if (selectedColor) {
                    addToColorQueue(blockId, selectedColor);
                    setBlockIdToBlockState(blockId, "finalized");
                }
            });
        }

        removeConfirmedBlocksSlot(slot);
    }

    return (
        <Wrapper
            key={network}
            blocksCount={indexToBlockId.length}
            isPlaying={isPlaying}
            network={network}
            networkConfig={networkConfig}
            selectNode={() => {}}
            selectedFeedItem={selectedFeedItem}
            setIsPlaying={setIsPlaying}
            isEdgeRenderingEnabled={isEdgeRenderingEnabled}
            setEdgeRenderingEnabled={(checked) => setEdgeRenderingEnabled(checked)}
            themeMode={themeMode}
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
                    <Emitter
                        emitterRef={emitterRef}
                        setRunListeners={setRunListeners}
                        cameraXShift={cameraXShift}
                        azimuthAngle={azimuthAngle}
                    />
                </Center>
                {features.cameraControls && <CameraControls azimuthAngle={azimuthAngle} />}
                {features.statsEnabled && <Perf />}
            </Canvas>
        </Wrapper>
    );
};

export default VisualizerInstance;
