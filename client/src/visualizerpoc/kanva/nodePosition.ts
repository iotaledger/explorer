import { useRef } from "react";
import { generateCoordinateGrid, batchDataCounter } from "../common/heplers";
import { Nodes } from "../common/Nodes";
import { NetworkNode } from "../common/types";

const ctx: Worker = self as any;

// const positions = useRef<number[]>(generateCoordinateGrid(start, end, limit));
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

        console.log("--- data", data);

        // collect info by portions and return it when it's 10 items
        const isBatchLimit = batchCounter();
        if (isBatchLimit) {
            ctx.postMessage("pong");
        }
    }
);

export {};
