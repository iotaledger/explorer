import { INodeData } from "../../models/graph/stardust/INodeData";

export interface VivaLink {
    data?: INodeData;
    fromId: string;
    toId: string;
    id: string;
}

export interface VivaNode {
    data: never;
    id: string;
    links: VivaLink[];
}
