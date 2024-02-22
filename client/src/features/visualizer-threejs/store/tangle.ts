import { Color } from "three";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ZOOM_DEFAULT, SPRAY_DISTANCE } from "../constants";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";
import { IThreeDimensionalPosition } from "../interfaces";
import { BlockId, SlotIndex } from "@iota/sdk-wasm-nova/web";
import { getVisualizerConfigValues } from "~features/visualizer-threejs/ConfigControls";

export interface IBlockAnimationPosition {
    initPosition: IThreeDimensionalPosition;
    targetPosition: IThreeDimensionalPosition;
    blockAddedTimestamp: number;
    elapsedTime: number;
}

export interface IBlockState extends Omit<IBlockAnimationPosition, "elapsedTime"> {
    id: string;
    color: Color;
}

interface Edge {
    fromBlockId: string;
    toBlockId: string;
}

interface EdgeEntry {
    fromPosition: number[];
    toPositions: [x: number, y: number, z: number][];
}

interface TangleState {
    // Queue for "add block" operation to the canvas
    blockQueue: IBlockState[];
    addToBlockQueue: (
        newBlock: IBlockState & {
            initPosition: IThreeDimensionalPosition;
            targetPosition: IThreeDimensionalPosition;
            blockAddedTimestamp: number;
        },
    ) => void;
    removeFromBlockQueue: (blockIds: string[]) => void;

    edgeQueue: Edge[];
    addToEdgeQueue: (blockId: string, parents: string[]) => void;
    removeFromEdgeQueue: (edges: Edge[]) => void;

    colorQueue: Pick<IBlockState, "id" | "color">[];
    addToColorQueue: (blockId: string, color: Color) => void;
    removeFromColorQueue: (blockIds: string[]) => void;

    // Map of blockId to index in Tangle 'InstancedMesh'
    blockIdToIndex: Map<string, number>;
    blockIdToEdges: Map<string, EdgeEntry>;
    blockIdToPosition: Map<string, [x: number, y: number, z: number]>;
    blockMetadata: Map<string, IFeedBlockData>;

    indexToBlockId: string[];
    updateBlockIdToIndex: (blockId: string, index: number) => void;

    zoom: number;
    setZoom: (zoom: number) => void;

    forcedZoom: number | undefined;
    setForcedZoom: (zoom: number | undefined) => void;

    bps: number;
    setBps: (bps: number) => void;

    clickedInstanceId: string | null;
    setClickedInstanceId: (instanceId: string | null) => void;

    blockIdToAnimationPosition: Map<string, IBlockAnimationPosition>;
    updateBlockIdToAnimationPosition: (updatedPositions: Map<string, IBlockAnimationPosition>) => void;

    resetConfigState: () => void;

    // Confirmed/accepted blocks by slot
    confirmedBlocksBySlot: Map<number, string[]>;
    addToConfirmedBlocksBySlot: (blockId: BlockId, slot: SlotIndex) => void;
    removeConfirmedBlocksSlot: (slot: SlotIndex) => void;
}

const INITIAL_STATE = {
    blockQueue: [],
    edgeQueue: [],
    colorQueue: [],
    blockIdToEdges: new Map(),
    blockIdToIndex: new Map(),
    blockIdToPosition: new Map(),
    blockMetadata: new Map(),
    blockIdToAnimationPosition: new Map(),
    indexToBlockId: [],
    zoom: ZOOM_DEFAULT,
    forcedZoom: undefined,
    bps: 0,
    clickedInstanceId: null,
    confirmedBlocksBySlot: new Map(),
};

export const useTangleStore = create<TangleState>()(
    devtools((set) => ({
        ...INITIAL_STATE,
        resetConfigState: () => set(INITIAL_STATE),
        updateBlockIdToAnimationPosition: (updatedPositions) => {
            set((state) => {
                updatedPositions.forEach((value, key) => {
                    state.blockIdToAnimationPosition.set(key, value);
                });

                const { emitterSpeedMultiplier } = getVisualizerConfigValues();

                for (const [key, value] of state.blockIdToAnimationPosition) {
                    // const animationTime = SPRAY_DISTANCE / emitterSpeedMultiplier;
                    const animationTime = SPRAY_DISTANCE / emitterSpeedMultiplier;
                    if (value.elapsedTime > animationTime) {
                        state.blockIdToAnimationPosition.delete(key);
                    }
                }
                return {
                    blockIdToAnimationPosition: state.blockIdToAnimationPosition,
                };
            });
        },
        addToBlockQueue: (block) => {
            set((state) => {
                const { initPosition, targetPosition, blockAddedTimestamp, ...blockRest } = block;

                state.blockIdToPosition.set(block.id, [targetPosition.x, targetPosition.y, targetPosition.z]);
                state.blockIdToAnimationPosition.set(block.id, {
                    initPosition,
                    blockAddedTimestamp,
                    targetPosition,
                    elapsedTime: 0,
                });
                return {
                    ...state,
                    blockQueue: [...state.blockQueue, { initPosition, targetPosition, blockAddedTimestamp, ...blockRest }],
                };
            });
        },
        removeFromBlockQueue: (blockIds: string[]) => {
            if (!blockIds.length) return;
            set((state) => ({
                blockQueue: state.blockQueue.filter((b) => !blockIds.includes(b.id)),
            }));
        },
        addToEdgeQueue: (blockId: string, parents: string[]) => {
            if (parents.length > 0) {
                set((state) => {
                    const nextEdgesQueue = [...state.edgeQueue];

                    for (const parentBlockId of parents) {
                        nextEdgesQueue.push({ fromBlockId: parentBlockId, toBlockId: blockId });
                    }

                    return {
                        ...state,
                        edgeQueue: nextEdgesQueue,
                    };
                });
            }
        },
        removeFromEdgeQueue: (edgesToRemove: Edge[]) => {
            set((state) => ({
                ...state,
                edgeQueue: state.edgeQueue.filter(
                    (edge) =>
                        !edgesToRemove.some(
                            (edgeToRemove) => edgeToRemove.toBlockId === edge.toBlockId && edgeToRemove.fromBlockId === edge.fromBlockId,
                        ),
                ),
            }));
        },
        addToColorQueue: (id: string, color: Color) => {
            set((state) => ({
                ...state,
                colorQueue: [...state.colorQueue, { id, color }],
            }));
        },
        removeFromColorQueue: (blockIds) => {
            if (blockIds.length > 0) {
                set((state) => ({
                    ...state,
                    colorQueue: state.colorQueue.filter((block) => !blockIds.includes(block.id)),
                }));
            }
        },
        updateBlockIdToIndex: (blockId: string, index: number) => {
            set((state) => {
                state.blockIdToIndex.set(blockId, index);
                if (state.indexToBlockId[index]) {
                    // Clean up map from old blockIds
                    state.blockIdToIndex.delete(state.indexToBlockId[index]);
                    // Clean up old block edges
                    state.blockIdToEdges.delete(state.indexToBlockId[index]);
                    // Clean up old block position
                    state.blockIdToPosition.delete(state.indexToBlockId[index]);
                    // Clean up old block metadata
                    state.blockMetadata.delete(state.indexToBlockId[index]);
                }

                const nextIndexToBlockId = [...state.indexToBlockId];
                nextIndexToBlockId[index] = blockId;

                return {
                    ...state,
                    indexToBlockId: nextIndexToBlockId,
                };
            });
        },
        setZoom: (zoom) => {
            set((state) => ({
                ...state,
                zoom,
            }));
        },
        setForcedZoom: (forcedZoom) => {
            set((state) => ({
                ...state,
                forcedZoom,
            }));
        },
        setBps: (bps) => {
            set((state) => ({
                ...state,
                bps,
            }));
        },
        setClickedInstanceId: (clickedInstanceId) => {
            set((state) => ({
                ...state,
                clickedInstanceId,
            }));
        },
        addToConfirmedBlocksBySlot: (blockId, slot) => {
            set((state) => {
                state.confirmedBlocksBySlot.has(slot)
                    ? state.confirmedBlocksBySlot.get(slot)?.push(blockId)
                    : state.confirmedBlocksBySlot.set(slot, [blockId]);
                return {
                    ...state,
                    confirmedBlocksBySlot: state.confirmedBlocksBySlot,
                };
            });
        },
        removeConfirmedBlocksSlot: (slot) => {
            set((state) => {
                state.confirmedBlocksBySlot.delete(slot);

                // Cleanup all slots that are lower than the current slot
                for (const existingSlot of state.confirmedBlocksBySlot.keys()) {
                    if (existingSlot < slot) {
                        state.confirmedBlocksBySlot.delete(existingSlot);
                    }
                }

                return {
                    ...state,
                    confirmedBlocksBySlot: state.confirmedBlocksBySlot,
                };
            });
        },
    })),
);
