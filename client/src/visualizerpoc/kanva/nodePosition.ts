import { useRef } from "react";
import { generateCoordinateGrid, batchDataCounter } from "../common/heplers";
import { Nodes, Node } from "../common/Nodes";
import { NetworkNode } from "../common/types";

// @ts-expect-error type any
const ctx: Worker = self as any;

const batchCounter = batchDataCounter();

const nodesInstance = new Nodes();

// TODO we need to collect updates like change size, color, position and return it in batch

ctx.addEventListener(
    "message",
    (e: MessageEvent<{ type: string; data: NetworkNode }>) => {
        const type = e.data?.type;
        const data = e.data?.data;

        if (!e.data || type?.startsWith("webpack")) {
            return; // Ignore the message if it's from Webpack. In other case we'll have an infinite loop
        }

        const calculatedNode: Node = {
            id: data?.blockId,
            x: 0,
            y: 0
        };

        nodesInstance.add(calculatedNode);

        // collect info by portions and return it when it's 10 items
        const isBatchLimit = batchCounter();
        if (isBatchLimit) {
            const updates = nodesInstance.getUpdates();
            ctx.postMessage(updates);
            nodesInstance.clearUpdates();
        }
    }
);

export {};
