import { CurrencyState } from "./CurrencyState";

export interface FeedsState extends CurrencyState {
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
         * The trunk.
         */
        trunk: string;
        /**
         * The branch.
         */
        branch: string;
        /**
         * The transaction value.
         */
        value: number;
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
