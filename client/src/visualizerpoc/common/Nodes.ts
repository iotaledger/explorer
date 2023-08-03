export interface Node {
    id: string;
    x: number;
    y: number;
    color?: string;
    radius?: number;
}

export interface Updates {
    add: Node[];
    modify: Node[];
    remove: Node[];
}

export class Nodes {
    public list: Node[] = [];

    public ids: string[] = [];

    public dict: Map<string, Node> = new Map();

    public updates: Updates = {
        add: [],
        modify: [],
        remove: []
    };

    constructor() {
        this.list = [];
    }

    public add(node: Node) {
        this.list.push(node);
        this.ids.push(node.id);
        this.dict.set(node.id, node);

        this.updates.add.push(node);
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
