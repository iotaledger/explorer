// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { generateCoordinateGrid } from "../../shared/visualizer/helpers";
import { colors, NODE_SIZE_DEFAULT, THRESHOLD_PX_Y } from "./lib/constants";
import { DataSender } from "./lib/DataSender";
import {
    batchDataCounter,
    yCoordinateGenerator,
    generateX
} from "./lib/heplers";
import { Nodes, WorkerNode } from "./lib/Nodes";
import { Shift } from "./lib/Shift";
import { WorkerType } from "./lib/types";
import { WorkerEventOnNode, WorkerEventSetStageWidth } from "./worker.types";

/**
 * Initialize constants for worker
 */
// @ts-expect-error type any
const ctx: Worker = self as any;

const batchCounter = batchDataCounter();

const nodesInstance = new Nodes();
const shiftInstance = new Shift();
const dataSenderInstance = new DataSender();

const getYCoordinate = yCoordinateGenerator();

let currentShift = 0;

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
    (e: MessageEvent<WorkerEventOnNode | WorkerEventSetStageWidth>) => {
        if (!e.data || e.data?.type?.startsWith("webpack")) {
            return; // Ignore the message if it's from Webpack. In other case we'll have an infinite loop
        }

        if (e.data.type === "setStageWidth") {
            shiftInstance.setStageWidth(e.data?.data);
            return;
        }
        if (e.data.type === "setStageHeight") {
            shiftInstance.setStageHeight(e.data?.data);
            return;
        }

        const { type, data } = e.data as WorkerEventOnNode;

        const rightShiftVisible = shiftInstance.calculateRightShift(
            // @ts-expect-error wrong type
            data.timestamp
        );

        const shiftRangeVisible = shiftInstance.getRangeShiftVisible();

        nodesInstance.removeNodesOutOfScreen(shiftRangeVisible);

        if (!nodesInstance.isNodesReachedByShift(rightShiftVisible)) {
            const { x, y } = getCoordinates(rightShiftVisible);
            const random = Math.floor(Math.random() * colors.length);

            const calculatedNode: WorkerNode = {
                id: data?.blockId,
                x,
                y,
                color: colors[random],
                radius: NODE_SIZE_DEFAULT
            };

            nodesInstance.add(calculatedNode, rightShiftVisible);
            nodesInstance.updateParents(data);
            // nodesInstance.checkLimit();
        }

        // collect info by portions and return it when it's 10 items
        // note: we can also batch and return data based on shift param
        const isBatchLimit = batchCounter();
        if (dataSenderInstance.shouldSend(data.timestamp)) {
            const msg = nodesInstance.getSendMessage();
            const zoom = nodesInstance.getZoom();

            console.log("--- zoom", zoom);
            // eslint-disable-next-line no-warning-comments
            // TODO detect number of noder per second here
            // eslint-disable-next-line no-warning-comments
            // TODO crop number of nodes depends on nodes per second here
            ctx.postMessage({
                type: WorkerType.Full,
                payload: {
                    ...msg,
                    zoom,
                    shift: rightShiftVisible
                }
            });
            nodesInstance.clearUpdates();
        }

        // if (timestamps.length > 1000) {
        //     ctx.postMessage(timestamps);
        //     timestamps.length = 0;
        // }
    }
);

export {};
