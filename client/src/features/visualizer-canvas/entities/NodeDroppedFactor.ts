export class NodeDroppedFactor {
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

    // current node count need to be no more than 50;
    // if prev value was less than min - check current to not allow more than 50
}
