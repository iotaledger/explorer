import { NODE_SIZE_INCREMENT, NODES_LIMIT } from "./constants";
import { NetworkNode } from "./types";

export interface WorkerNode {
    id: string;
    x: number;
    y: number;
    color?: string;
    radius: number;
}

export interface Updates {
    add: WorkerNode[];
    modify: WorkerNode[];
    remove: WorkerNode[];
}

export interface ZoomY {
    maxY: number;
    minY: number;
}

export class Nodes {
    public maxY = 0;

    public minY = 0;

    public zoom = 0.25;

    public list: WorkerNode[] = [];

    public ids: string[] = [];

    public dict: Map<string, WorkerNode> = new Map();

    public updates: Updates = {
        add: [],
        modify: [],
        remove: []
    };

    constructor() {
        this.list = [];
    }

    public add(node: WorkerNode) {
        this.list.push(node);
        this.ids.push(node.id);
        this.dict.set(node.id, node);

        this.updates.add.push(node);

        this.checkScaleUp(node.y);
    }

    public checkLimit() {
        if (this.list.length > NODES_LIMIT) {
            const removed = this.list.shift() as WorkerNode;
            this.ids.shift();
            this.dict.delete(removed?.id);
            this.updates.remove.push(removed);
            // this.checkScaleDown(removed.y);
        }
    }

    public updateParents(node: NetworkNode) {
        if (node?.parents?.length) {
            for (const parent of node.parents) {
                const parentNode = this.dict.get(parent);

                if (parentNode) {
                    parentNode.radius += NODE_SIZE_INCREMENT;
                    this.updates.modify.push(parentNode);
                }
            }
        }
    }

    public getSendMessage() {
        return {
            ...this.updates,
            maxY: this.maxY,
            minY: this.minY
        };
    }

    public getUpdates() {
        return this.updates;
    }

    public clearUpdates() {
        this.updates = {
            add: [],
            modify: [],
            remove: []
        };
    }

    private readonly checkScaleUp = (y: number) => {
        if (y > 0 && y > this.maxY) {
            this.maxY = y;
        }
        if (y < 0 && y < this.minY) {
            this.minY = y;
        }
    };

    private readonly checkScaleDown = (y: number) => {
        if (y > 0 && y <= this.maxY) {
            this.maxY = y;
        }
        if (y < 0 && y >= this.minY) {
            this.minY = y;
        }
    };
}
