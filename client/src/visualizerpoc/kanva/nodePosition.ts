import { useRef } from "react";
import { generateCoordinateGrid, batchDataCounter } from "../common/heplers";

const ctx: Worker = self as any;

const data = 1;

// const positions = useRef<number[]>(generateCoordinateGrid(start, end, limit));
const batchCounter = batchDataCounter();

ctx.addEventListener(
    "message",
    (e: MessageEvent<{ type: string; data: never }>) => {
        const type = e.data?.type;

        if (!e.data || type?.startsWith("webpack")) {
            return; // Ignore the message if it's from Webpack
        }

        // collect info by portions and return it when it's 10 items
        const isBatchLimit = batchCounter();
        if (isBatchLimit) {
            ctx.postMessage("pong");
        }
    }
);

export {};
