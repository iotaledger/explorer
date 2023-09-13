import { NetworkNode } from "../lib/types";

export class NodeDroppedFactor {
    public allIncomeNodes: NetworkNode[] = [];

    // arr.length calculate every time, so better to store separate value.
    public allIncomeNodesLength = 0;

    private readonly minNodesUi = 20;

    private readonly startDroppedFactor = 30;

    private readonly maxNodesUi = 50;

    private readonly maxBps = 1000;

    // here we can implement memoization if needs
    public getAllowedNumberOfNodes = (numberNodesPrevShift: number) => {
        const allowedPercent =
            (numberNodesPrevShift - this.startDroppedFactor) /
            (this.maxBps - this.startDroppedFactor);

        return numberNodesPrevShift < this.minNodesUi
            ? numberNodesPrevShift
            : (this.maxNodesUi - this.startDroppedFactor) * allowedPercent;
    };

    public addIncomeNode = (node: NetworkNode) => {
        this.allIncomeNodes.push(node);
        this.allIncomeNodesLength += 1;
    };

    public clearIncomeNodes = () => {
        this.allIncomeNodes = [];
        this.allIncomeNodesLength = 0;
    };

    // current node count need to be no more than 50;
    // if prev value was less than min - check current to not allow more than 50
}
