// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { generateCoordinateGrid } from "../../shared/visualizer/helpers";
import { DataSender } from "./entities/DataSender";
import { NodeDroppedFactor } from "./entities/NodeDroppedFactor";
import { Nodes, WorkerNode } from "./entities/Nodes";
import { Shift } from "./entities/Shift";
import { colors, NODE_SIZE_DEFAULT, THRESHOLD_PX_Y } from "./lib/constants";
import {
    batchDataCounter,
    yCoordinateGenerator,
    generateX
} from "./lib/heplers";
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
const ndfInstance = new NodeDroppedFactor();

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
            const yMultiplier =
                nodesInstance.getShiftMultiplier(rightShiftVisible);

            const calculatedNode: WorkerNode = {
                id: data?.blockId,
                x,
                y: y * yMultiplier,
                color: colors[random],
                radius: NODE_SIZE_DEFAULT
            };

            const prevRightShift = rightShiftVisible - 1;
            const prevShiftNodesCount =
                nodesInstance.getShiftCountMap(prevRightShift);

            nodesInstance.add(calculatedNode, rightShiftVisible);
            nodesInstance.addShiftCountMap(rightShiftVisible);
            nodesInstance.updateParents(data);
            // nodesInstance.checkLimit();
        }

        // collect info by portions and return it when it's 10 items
        // note: we can also batch and return data based on shift param
        const isBatchLimit = batchCounter();
        if (dataSenderInstance.shouldSend(data.timestamp)) {
            const msg = nodesInstance.sendMessagePayload;
            const zoom = nodesInstance.getZoom();

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
