export interface Node {
    id: string;
    x: number;
    y: number;
    color: string;
    radius: number;
}

export class Nodes {
    public list: Node[] = [];

    public dict: Map<string, Node> = new Map();

    public updates: {
        modify: Nodes[]; // here we also include 'add' operation
        remove: Nodes[];
    } = {
        modify: [],
        remove: []
    };

    constructor() {
        this.list = [];
    }
}
