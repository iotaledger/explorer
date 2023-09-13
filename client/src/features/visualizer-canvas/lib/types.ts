import { IFeedBlockData } from "../../../models/api/stardust/feed/IFeedBlockData";
import { Updates as PayloadNodesUpdates } from "../entities/Nodes";

export enum WorkerType {
    Full = "Full",
    UpdateNodes = "UpdateNodes",
    UpdateShift = "UpdateShift",
    UpdateZoom = "UpdateZoom"
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

export interface PayloadShift {
    shift: number;
}

export interface PayloadZoom {
    zoom: number;
}

export interface WorkerUpdateFull {
    type: WorkerType.Full;
    payload: PayloadNodesUpdates & PayloadShift & PayloadZoom;
}

export interface WorkerUpdateNodes {
    type: WorkerType.UpdateNodes;
    payload: PayloadNodesUpdates;
}

export interface WorkerUpdateShift {
    type: WorkerType.UpdateShift;
    payload: PayloadShift;
}
export interface WorkerUpdateZoom {
    type: WorkerType.UpdateZoom;
    payload: PayloadZoom;
}
