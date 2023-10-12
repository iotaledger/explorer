import { IFeedBlockData } from "../../../models/api/stardust/feed/IFeedBlockData";

export type WorkerEventType =
    | "add"
    | "update"
    | "setStageWidth"
    | "setStageHeight"
    | string;

export type NetworkNode = IFeedBlockData;



export interface _WorkerReq {
    type: WorkerEventType;
    data: NetworkNode & { timestamp: number };
}

// export type Wor

export enum WorkerType {
    Full = "Full",
}
