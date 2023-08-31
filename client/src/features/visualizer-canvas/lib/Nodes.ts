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

    /**
     * Shift map needs to detect if node out of screen and we can remove it
     */
    public shiftMap: Map<number, string[]> = new Map();

    public lastShiftForRemove?: number;

    public dict: Map<string, WorkerNode> = new Map();

    public updates: Updates = {
        add: [],
        modify: [],
        remove: []
    };

    constructor() {
        this.list = [];
    }

    public add(node: WorkerNode, shift: number) {
        this.list.push(node);
        this.ids.push(node.id);
        this.dict.set(node.id, node);
        this.addToShiftMap(node, shift);

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

    public isNodesReachedByShift(shift: number) {
        const nodes = this.shiftMap.get(shift);
        if (!nodes) {
            return false;
        }
        return false;
        // return nodes.length > 20;
    }

    public removeNodesOutOfScreen(shiftRangeVisible: number[]) {
        for (const key of this.shiftMap.keys()) {
            if (!shiftRangeVisible.includes(key)) {
                const nodes = this.shiftMap.get(key);
                if (nodes) {
                    for (const id of nodes) {
                        const node = this.dict.get(id);
                        if (node) {
                            this.updates.remove.push(node);
                        }
                    }
                }
                this.shiftMap.delete(key);
            }
        }
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

    private addToShiftMap(node: WorkerNode, shift: number) {
        const nodes = this.shiftMap.get(shift) ?? [];
        nodes.push(node.id);
        this.shiftMap.set(shift, nodes);
    }
}
