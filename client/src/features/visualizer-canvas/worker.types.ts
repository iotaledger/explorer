import { NetworkNode } from "./lib/types";

export type WorkerEventType = "add" | "update" | "setStageWidth" | string;

export interface WorkerEventOnNode {
    type: WorkerEventType;
    data: NetworkNode & { timestamp: number };
}

export interface WorkerEventSetStageWidth {
    type: WorkerEventType;
    data: number;
}

