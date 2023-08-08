// @ts-nocheck
import { THRESHOLD_PX_Y } from "../common/constants";
import {
    generateCoordinateGrid,
    batchDataCounter,
    yCoordinateGenerator,
    generateX
} from "../common/heplers";
import { Nodes, WorkerNode } from "../common/Nodes";
import { NetworkNode } from "../common/types";

/**
 * Initialize constants for worker
 */
// @ts-expect-error
// @ts-expect-error type any
const ctx: Worker = self as any;

const batchCounter = batchDataCounter();

const nodesInstance = new Nodes();

const getYCoordinate = yCoordinateGenerator();

let currentShift = 0;

// TODO we need to collect updates like change size, color, position and return it in batch

/**
 * generate coordinates for node
 * @param shift
 */
const getCoordinates = (shift: number) => {
    let Y = getYCoordinate.next().value;
    if (!currentShift || currentShift !== shift) {
        Y = getYCoordinate.next(true).value;
    }

    const X = generateX(shift);

    // update shift locally
    currentShift = shift;

    return { x: X, y: Y * THRESHOLD_PX_Y };
};

ctx.addEventListener(
    "message",
    (
        e: MessageEvent<{
            type: "add" | "update" | string;
            graphShift: number;
            data: NetworkNode;
        }>
    ) => {
        const type = e.data?.type;
        const data = e.data?.data;
        const shift = e.data?.graphShift;

        if (!e.data || type?.startsWith("webpack")) {
            return; // Ignore the message if it's from Webpack. In other case we'll have an infinite loop
        }

        const { x, y } = getCoordinates(shift);

        const calculatedNode: WorkerNode = {
            id: data?.blockId,
            x,
            y
        };

        nodesInstance.add(calculatedNode);
        nodesInstance.checkLimit();

        // collect info by portions and return it when it's 10 items
        // note: we can also batch and return data based on shift param
        const isBatchLimit = batchCounter();
        if (isBatchLimit) {
            const updates = nodesInstance.getUpdates();
            ctx.postMessage(updates);
            nodesInstance.clearUpdates();
        }
    }
);

export {};
