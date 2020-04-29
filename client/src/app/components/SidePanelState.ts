export interface SidePanelState {
    /**
     * The transactions per second.
     */
    transactionsPerSecond: string;

    /**
     * The transactions per second.
     */
    transactionsPerSecondHistory: number[];

    /**
     * Latest transactions.
     */
    transactions: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number
    }[];

    /**
     * Latest milestones.
     */
    milestones: {
        /**
         * The transaction hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}
