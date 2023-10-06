import { IFeedBlockData } from "../../../models/api/stardust/feed/IFeedBlockData";

export type WorkerEventType =
    | "add"
    | "update"
    | "setStageWidth"
    | "setStageHeight"
    | string;

export type NetworkNode = IFeedBlockData;

export interface WorkerReq {
    type: WorkerEventType;
    data: NetworkNode & { timestamp: number };
}

export enum WorkerType {
    Full = "Full",
}
