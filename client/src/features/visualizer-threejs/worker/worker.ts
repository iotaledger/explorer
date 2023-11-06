// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { generateCoordinateGrid } from "../../shared/visualizer/helpers";
import { DataSender } from "./entities/DataSender";
import { NodeDroppedFactor } from "./entities/NodeDroppedFactor";
import { Nodes, WorkerNode } from "./entities/Nodes";
import { Shift } from "./entities/Shift";
import { _WorkerReq, WorkerType } from "./worker.types";
import { colors, NODE_SIZE_DEFAULT } from "../constants";
import { generateXbyShift, getGenerateY } from "../utils";

/**
 * Initialize constants for worker
 */
const ctx: Worker = self as never;

const nodesInstance = new Nodes();
const shiftInstance = new Shift();
const dataSenderInstance = new DataSender();
const ndfInstance = new NodeDroppedFactor();

/**
 * generate coordinates for node
 * @param shift
 */
const generateY = getGenerateY();
const getCoordinates = (shift: number) => {
    const y = generateY(shift);
    const x = generateXbyShift(shift);
    return { x, y };
};

ctx.addEventListener(
    "message",
    (e: MessageEvent<_WorkerReq>) => {
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

        const { data } = e.data;

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
                const yMultiplier = 1 + (ndfInstance.getAllowedNumberOfNodes().percent * 2);

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
    }
);

export {};
