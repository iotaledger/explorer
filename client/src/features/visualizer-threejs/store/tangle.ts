import { Color } from "three";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ZOOM_DEFAULT, ANIMATION_TIME_SECONDS } from "../constants";
import { IFeedBlockData } from "~models/api/stardust/feed/IFeedBlockData";

interface IPosition {
    x: number;
    y: number;
    z: number;
}

export interface IBlockInitPosition extends IPosition {
    duration: number;
}

export interface BlockState {
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
    blockQueue: BlockState[];
    addToBlockQueue: (newBlock: BlockState & { initPosition: IPosition; targetPosition: IPosition; }) => void;
    removeFromBlockQueue: (blockIds: string[]) => void;

    edgeQueue: Edge[];
    addToEdgeQueue: (blockId: string, parents: string[]) => void;
    removeFromEdgeQueue: (edges: Edge[]) => void;

    colorQueue: Pick<BlockState, "id" | "color">[];
    addToColorQueue: (blockId: string, color: Color) => void;
    removeFromColorQueue: (blockId: string) => void;

    // Map of blockId to index in Tangle 'InstancedMesh'
    blockIdToIndex: Map<string, number>;
    blockIdToEdges: Map<string, EdgeEntry>;
    blockIdToPosition: Map<string, [x: number, y: number, z: number]>;
    blockMetadata: Map<string, IFeedBlockData>;
    blockIdToAnimationPosition: Map<string, IBlockInitPosition>;

    indexToBlockId: string[];
    updateBlockIdToIndex: (blockId: string, index: number) => void;

    yPositions: { [k: number]: number };
    addYPosition: (blockY: number) => void;
    removeYPosition: (blockY: number) => void;

    zoom: number;
    setZoom: (zoom: number) => void;

    bps: number;
    setBps: (bps: number) => void;

    clickedInstanceId: string | null;
    setClickedInstanceId: (instanceId: string | null) => void;

    updateBlockIdToAnimationPosition: (updatedPositions: Map<string, IBlockInitPosition>) => void;
}

export const useTangleStore = create<TangleState>()(devtools((set, get) => ({
    blockQueue: [],
    edgeQueue: [],
    colorQueue: [],
    blockIdToEdges: new Map(),
    blockIdToIndex: new Map(),
    blockIdToPosition: new Map(),
    blockMetadata: new Map(),
    blockIdToAnimationPosition: new Map(),
    indexToBlockId: [],
    yPositions: {},
    zoom: ZOOM_DEFAULT,
    bps: 0,
    clickedInstanceId: null,
    updateBlockIdToAnimationPosition: (updatedPositions) => {
        set(state => {
            updatedPositions.forEach((value, key) => {
                state.blockIdToAnimationPosition.set(key, value);
            });

            for (const [key, value] of state.blockIdToAnimationPosition) {
                if (value.duration > ANIMATION_TIME_SECONDS) {
                    state.blockIdToAnimationPosition.delete(key);
                }
            }
            return {
                blockIdToAnimationPosition: state.blockIdToAnimationPosition
            };
        });
    },
    addToBlockQueue: block => {
        set(state => {
            const { initPosition, targetPosition, ...blockRest } = block;

            state.blockIdToPosition.set(block.id, [targetPosition.x, targetPosition.y, targetPosition.z]);
            state.blockIdToAnimationPosition.set(block.id, {
                ...initPosition,
                duration: 0,
            });
            return {
                ...state,
                blockQueue: [...state.blockQueue, blockRest]
            };
        });
    },
    removeFromBlockQueue: (blockIds: string[]) => {
        if (!blockIds.length) return;
        const prevBlockQueue = get().blockQueue;
        const blockQueue = prevBlockQueue.filter(b => !blockIds.includes(b.id));
        set(() => ({
            blockQueue
        }));
    },
    addToEdgeQueue: (blockId: string, parents: string[]) => {
        if (parents.length > 0) {
            set(state => {
                const nextEdgesQueue = [...state.edgeQueue];

                for (const parentBlockId of parents) {
                    nextEdgesQueue.push({ fromBlockId: parentBlockId, toBlockId: blockId });
                }

                return {
                    ...state,
                    edgeQueue: nextEdgesQueue
                };
            });
        }
    },
    removeFromEdgeQueue: (edgesToRemove: Edge[]) => {
        set(state => ({
            ...state,
            edgeQueue: state.edgeQueue.filter(
                edge => !edgesToRemove.some(
                    edgeToRemove =>
                        edgeToRemove.toBlockId === edge.toBlockId &&
                        edgeToRemove.fromBlockId === edge.fromBlockId
                )
            )
        }));
    },
    addToColorQueue: (id: string, color: Color) => {
        set(state => ({
            ...state,
            colorQueue: [...state.colorQueue, { id, color }]
        }));
    },
    removeFromColorQueue: (blockId: string) => {
        set(state => ({
            ...state,
            colorQueue: state.colorQueue.filter(block => block.id !== blockId)
        }));
    },
    updateBlockIdToIndex: (blockId: string, index: number) => {
        set(state => {
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
                indexToBlockId: nextIndexToBlockId
            };
        });
    },
    addYPosition: blockY => {
        const Y = Math.floor(Math.abs(blockY));

        set(state => {
            const nextYPositions = { ...state.yPositions };

            const prevYCount = nextYPositions[Y] || 0;
            nextYPositions[Y] = prevYCount + 1;
            return {
                ...state,
                yPositions: nextYPositions
            };
        });
    },
    removeYPosition: blockY => {
        const Y = Math.floor(Math.abs(blockY));

        set(state => {
            const nextYPositions = { ...state.yPositions };
            const current = nextYPositions[Y];
            if (current === 1) {
                delete nextYPositions[Y];
            } else {
                nextYPositions[Y] -= 1;
            }
            return {
                ...state,
                yPositions: nextYPositions
            };
        });
    },
    setZoom: zoom => {
        set(state => ({
            ...state,
            zoom
        }));
    },
    setBps: bps => {
        set(state => ({
            ...state,
            bps
        }));
    },
    setClickedInstanceId: clickedInstanceId => {
        set(state => ({
            ...state,
            clickedInstanceId
        }));
    }
})));

