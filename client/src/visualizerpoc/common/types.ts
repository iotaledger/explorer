import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";

export type NetworkNode = IFeedBlockData;

export interface PositionMap {
    [key: string]: { x: number; y: number };
}
