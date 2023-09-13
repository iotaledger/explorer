// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { generateCoordinateGrid } from "../../shared/visualizer/helpers";
import { DataSender } from "./entities/DataSender";
import { NodeDroppedFactor } from "./entities/NodeDroppedFactor";
import { Nodes, WorkerNode } from "./entities/Nodes";
import { Shift } from "./entities/Shift";
import { colors, NODE_SIZE_DEFAULT, THRESHOLD_PX_Y } from "./lib/constants";
import { yCoordinateGenerator, generateX } from "./lib/heplers";
import { WorkerType } from "./lib/types";
import { WorkerEventOnNode, WorkerEventSetStageWidth } from "./worker.types";

/**
 * Initialize constants for worker
 */
// @ts-expect-error type any
const ctx: Worker = self as any;

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

        // timestamp doesn't attach on hot reload
        if (!data?.timestamp) {
            return;
        }

        const rightShiftVisible = shiftInstance.calculateRightShift(
            // @ts-expect-error wrong type
            data.timestamp
        );

        const shiftRangeVisible = shiftInstance.getRangeShiftVisible();

        nodesInstance.removeNodesOutOfScreen(shiftRangeVisible);

        ndfInstance.addIncomeNode(data);

        if (dataSenderInstance.shouldSend(data.timestamp)) {
            const msg = nodesInstance.sendMessagePayload;
            const zoom = nodesInstance.getZoom();
            const nodes = ndfInstance.getNodes();

            for (const node of nodes) {
                const { x, y } = getCoordinates(rightShiftVisible);
                const random = Math.floor(Math.random() * colors.length);
                const yMultiplier =
                    1 + ndfInstance.getAllowedNumberOfNodes().percent * 2;

                const calculatedNode: WorkerNode = {
                    id: node?.blockId,
                    x,
                    y: y * yMultiplier,
                    color: colors[0],
                    radius: NODE_SIZE_DEFAULT
                };

                nodesInstance.add(calculatedNode, rightShiftVisible);
                nodesInstance.updateParents(node);
            }
            ndfInstance.clearIncomeNodes();
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
