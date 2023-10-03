import { DATA_SENDER_TIME_INTERVAL, SECOND } from "../lib/constants";
import { NetworkNode } from "../lib/types";

/**
 * Generates a random subset of k elements from the given array.
 *
 * Utilizes a partial Fisher-Yates shuffle for efficiency (O(k)).
 *
 * @param arr Original array
 * @param k Size of subset to return
 * @returns Random subset of k elements
 */
export function randomSubset<T>(arr: T[], k: number) {
    const n = arr.length;
    const subset = arr.slice();
    for (let i = 0; i < k; i++) {
        const randIdx = i + Math.floor(Math.random() * (n - i));
        [subset[i], subset[randIdx]] = [subset[randIdx], subset[i]];
    }
    return subset.slice(0, k);
}


/**
 * Class for calculation how much nodes we can show on the screen.
 */
export class NodeDroppedFactor {
    public allIncomeNodes: NetworkNode[] = [];

    // arr.length calculate every time, so better to store separate value.
    public allIncomeNodesLength = 0;

    private readonly minNodesUi = 20;

    private readonly maxNodesUi = 50;

    private readonly maxBps = 1000;

    // here we can implement memoization if needs
    public getAllowedNumberOfNodes = () => {
        const incomeNodesPerSecond =
            (this.allIncomeNodesLength * SECOND) / DATA_SENDER_TIME_INTERVAL;

        if (incomeNodesPerSecond < this.minNodesUi) {
            return {
                percent: 0,
                uiNodesNumber: this.minNodesUi
            };
        }

        const diffBps = this.maxBps - this.minNodesUi;
        const diffUi = this.maxNodesUi - this.minNodesUi;
        const diffAllIncome = incomeNodesPerSecond - this.minNodesUi;

        const percent = diffAllIncome / diffBps;
        const increaseTo = diffUi * percent;

        const uiNodes = Math.round(this.minNodesUi + increaseTo);

        return {
            percent,
            uiNodesNumber: uiNodes
        };
    };

    public getNodes = () => {
        const allowedNumber = this.getAllowedNumberOfNodes();
        return randomSubset(
            this.allIncomeNodes,
            allowedNumber.uiNodesNumber
        ).filter(Boolean);
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
