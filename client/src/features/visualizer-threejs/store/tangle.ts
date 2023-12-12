import { Color } from "three";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ZOOM_DEFAULT } from "../constants";
import {IFeedBlockData} from "../../../models/api/stardust/feed/IFeedBlockData";

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

    colorQueue: Pick<BlockState, "id" | "color">[];
    addToColorQueue: (blockId: string, color: Color) => void;
    removeFromColorQueue: (blockId: string) => void;

    // Map of blockId to index in Tangle 'InstancedMesh'
    blockIdToIndex: Map<string, number>;
    blockIdToEdges: Map<string, EdgeEntry>;
    blockIdToPosition: Map<string, [x: number, y: number, z: number]>;
    blockMetadata: Map<string, IFeedBlockData>;

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
}

export const useTangleStore = create<TangleState>()(devtools(set => ({
    blockQueue: [],
    scaleQueue: [],
    edgeQueue: [],
    colorQueue: [],
    blockIdToEdges: new Map(),
    blockIdToIndex: new Map(),
    blockIdToPosition: new Map(),
    blockMetadata: new Map(),
    indexToBlockId: [],
    yPositions: {},
    zoom: ZOOM_DEFAULT,
    bps: 0,
    clickedInstanceId: null,
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

