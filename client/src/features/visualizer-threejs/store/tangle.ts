import { Color } from "three";
import { create } from "zustand";
import { ZOOM_DEFAULT } from "../constants";
import { getScaleMultiplier } from "../utils";

interface BlockState {
    id: string;
    position: [x: number, y: number, z: number];
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
    addToBlockQueue: (newBlock: BlockState) => void;
    removeFromBlockQueue: (blockIds: string[]) => void;

    scaleQueue: string[];
    addToScaleQueue: (blockId: string, parents: string[]) => void;
    removeFromScaleQueue: (blockIds: string[]) => void;

    edgeQueue: Edge[];
    addToEdgeQueue: (blockId: string, parents: string[]) => void;
    removeFromEdgeQueue: (edges: Edge[]) => void;

    // Map of blockId to index in Tangle 'InstancedMesh'
    blockIdToIndex: Map<string, number>;
    blockIdToEdges: Map<string, EdgeEntry>;
    blockIdToPosition: Map<string, [x: number, y: number, z: number]>;

    indexToBlockId: string[];
    updateBlockIdToIndex: (blockId: string, index: number) => void;

    yPositions: { [k: number]: number };
    addYPosition: (blockY: number) => void;
    removeYPosition: (blockY: number) => void;

    zoom: number;
    checkZoom: (canvasHeight: number) => void;
    setZoom: (zoom: number) => void;

    bps: number;
    setBps: (bps: number) => void;
}

export const useTangleStore = create<TangleState>(set => ({
    blockQueue: [],
    scaleQueue: [],
    edgeQueue: [],
    blockIdToEdges: new Map(),
    blockIdToIndex: new Map(),
    blockIdToPosition: new Map(),
    indexToBlockId: [],
    yPositions: {},
    zoom: ZOOM_DEFAULT,
    bps: 0,
    addToBlockQueue: newBlockData => {
        set(state => ({
            blockQueue: [...state.blockQueue, newBlockData]
        }));
    },
    removeFromBlockQueue: (blockIds: string[]) => {
        set(state => ({
            ...state,
            blockQueue: state.blockQueue.filter(b => !blockIds.includes(b.id))
        }));
    },
    addToScaleQueue: (_: string, parents: string[]) => {
        if (parents.length > 0) {
            set(state => {
                const nextScalesToUpdate = [...state.scaleQueue, ...parents];

                return {
                    ...state,
                    scaleQueue: nextScalesToUpdate
                };
            });
        }
    },
    removeFromScaleQueue: (blockIds: string[]) => {
        set(state => ({
            ...state,
            scaleQueue: state.scaleQueue.filter(blockId => !blockIds.includes(blockId))
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
    checkZoom: (canvasHeight: number) => {
        set(state => {
            const yPositions = Object.keys(state.yPositions).map(Number);
            const multiplier = getScaleMultiplier(yPositions, canvasHeight);

            return {
                ...state,
                zoom: multiplier
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
    }
}));

