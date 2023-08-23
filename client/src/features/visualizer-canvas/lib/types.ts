import { IFeedBlockData } from "../../../models/api/stardust/feed/IFeedBlockData";
import { Updates as NodesUpdates } from "./Nodes";

export enum WorkerType {
    UpdateNodes = "UpdateNodes",
    UpdateShift = "UpdateShift"
}

export type NetworkNode = IFeedBlockData;

export interface PositionMap {
    [key: string]: { x: number; y: number };
}

export interface IFeedBlockLocal extends IFeedBlockData {
    id: string;
    x: number;
    y: number;
}

export interface Link {
    source: string;
    target: string;
}

export interface WorkerUpdateNodes {
    type: WorkerType.UpdateNodes;
    payload: NodesUpdates;
}

export interface WorkerUpdateShift {
    type: WorkerType.UpdateShift;
    payload: number;
}
