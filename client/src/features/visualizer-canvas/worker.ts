// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { generateCoordinateGrid } from "../../shared/visualizer/helpers";
import { colors, THRESHOLD_PX_Y } from "./lib/constants";
import {
    batchDataCounter,
    yCoordinateGenerator,
    generateX
} from "./lib/heplers";
import { Nodes, WorkerNode } from "./lib/Nodes";
import { Shift } from "./lib/Shift";
import { NetworkNode } from "./lib/types";

/**
 * Initialize constants for worker
 */
// @ts-expect-error type any
const ctx: Worker = self as any;

const batchCounter = batchDataCounter();

const nodesInstance = new Nodes();
const shiftInstance = new Shift();

const getYCoordinate = yCoordinateGenerator();

let currentShift = 0;
const timestamps = [];

// eslint-disable-next-line no-warning-comments
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
            data: NetworkNode & { timestamp: number };
        }>
    ) => {
        const type = e.data?.type;
        const data = e.data?.data;
        const shift = e.data?.graphShift;

        if (!e.data || type?.startsWith("webpack")) {
            return; // Ignore the message if it's from Webpack. In other case we'll have an infinite loop
        }

        const shiftForNode = shiftInstance.calculateShift(data.timestamp);
        console.log("--- shiftForNode", shiftForNode);
        // timestamps.push(data.timestamp);

        const { x, y } = getCoordinates(shift);

        const random = Math.floor(Math.random() * colors.length);

        const calculatedNode: WorkerNode = {
            id: data?.blockId,
            x,
            y,
            color: colors[random],
            radius: 10
        };

        nodesInstance.add(calculatedNode);
        nodesInstance.updateParents(data);
        nodesInstance.checkLimit();

        // collect info by portions and return it when it's 10 items
        // note: we can also batch and return data based on shift param
        const isBatchLimit = batchCounter();
        if (isBatchLimit) {
            const msg = nodesInstance.getSendMessage();
            ctx.postMessage(msg);
            nodesInstance.clearUpdates();
        }

        // if (timestamps.length > 1000) {
        //     ctx.postMessage(timestamps);
        //     timestamps.length = 0;
        // }
    }
);

export {};
