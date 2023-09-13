import { NODE_SIZE_INCREMENT } from "../lib/constants";
import { NetworkNode } from "../lib/types";

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
    public maxY = 0;

    public minY = 0;

    public zoom = 1;

    public yPositions: { [k: number]: number } = {};

    /**
     * Shift map needs to detect if node out of screen and we can remove it
     */
    public shiftMap: Map<number, string[]> = new Map();

    /**
     * shiftCountMap needs to detect total number of nodes that came from network
     */
    public shiftCountMap: Map<number, number> = new Map();

    public dict: Map<string, WorkerNode> = new Map();

    public updates: Updates = {
        add: [],
        modify: [],
        remove: []
    };

    public get sendMessagePayload() {
        return this.updates;
    }

    public add(node: WorkerNode, shift: number) {
        this.dict.set(node.id, node);
        this.addToShiftMap(node, shift);

        this.updates.add.push(node);

        this.addYPosition(node);
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
        // return nodes.length > 25;
    }

    public getShiftMultiplier(shift: number) {
        const min = 25;
        const max = 250;

        const nodes = this.shiftMap.get(shift);
        if (!nodes || nodes.length < min) {
            return 1;
        }

        const diff = nodes.length - min;
        const range = max - min;
        const percent = (diff / range) * 3;
        return 1 + percent;
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
                            this.removeYPosition(node);
                        }
                    }
                }
                this.shiftMap.delete(key);
                this.shiftCountMap.delete(key);
            }
        }
    }

    public getZoom() {
        const max = Math.max(...Object.keys(this.yPositions).map(Number));
        return 240 / max;
    }

    public addShiftCountMap(shift: number) {
        const count = this.shiftCountMap.get(shift) ?? 0;
        this.shiftCountMap.set(shift, count + 1);
    }

    public getShiftCountMap(shift: number) {
        return this.shiftCountMap.get(shift) ?? 0;
    }

    private addToShiftMap(node: WorkerNode, shift: number) {
        const nodes = this.shiftMap.get(shift) ?? [];
        nodes.push(node.id);
        this.shiftMap.set(shift, nodes);
    }

    private addYPosition(node: WorkerNode) {
        const Y = Math.abs(node.y);
        const current = this.yPositions[Y];
        if (!current) {
            this.yPositions[Y] = 1;
            return;
        }
        this.yPositions[Y] += 1;
    }

    private removeYPosition(node: WorkerNode) {
        const Y = Math.abs(node.y);
        const current = this.yPositions[Y];
        if (current === 1) {
            delete this.yPositions[Y];
        } else {
            this.yPositions[Y] -= 1;
        }
    }
}
