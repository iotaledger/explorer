import { NetworkNode } from "../lib/types";

export class NodeDroppedFactor {
    public allIncomeNodes: NetworkNode[] = [];

    // arr.length calculate every time, so better to store separate value.
    public allIncomeNodesLength = 0;

    private readonly minNodesUi = 20;

    private readonly maxNodesUi = 50;

    private readonly maxBps = 500;

    // here we can implement memoization if needs
    public getAllowedNumberOfNodes = () => {
        if (this.allIncomeNodesLength < this.minNodesUi) {
            return this.allIncomeNodesLength;
        }

        const diffUi = this.maxNodesUi - this.minNodesUi;
        const diffBps = this.maxBps - this.minNodesUi;
        const diffAllIncome = this.allIncomeNodesLength - this.minNodesUi;

        const percent = diffAllIncome / diffBps;
        const diffWithPercent = diffUi * percent;

        const uiNodes = this.minNodesUi + diffWithPercent;

        return {
            percent,
            uiNodesNumber: uiNodes
        };
    };

    public addIncomeNode = (node: NetworkNode) => {
        // protect overloading
        if (this.allIncomeNodesLength >= this.maxBps) {
            return;
        }

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
