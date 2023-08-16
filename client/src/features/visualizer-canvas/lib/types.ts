import { IFeedBlockData } from "../../../models/api/stardust/feed/IFeedBlockData";

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
