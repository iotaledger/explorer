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

export class Nodes {
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
    }

    public checkLimit() {
        const LIMIT = 200;

        if (this.list.length > LIMIT) {
            const removed = this.list.shift() as WorkerNode;
            this.ids.shift();
            this.dict.delete(removed?.id);
            this.updates.remove.push(removed);
        }
    }

    public updateParents(node: NetworkNode) {
        if (node?.parents?.length) {
            for (const parent of node.parents) {
                const parentNode = this.dict.get(parent);

                if (parentNode) {
                    parentNode.radius += 10;
                    this.updates.modify.push(parentNode);
                }
            }
        }
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
}
