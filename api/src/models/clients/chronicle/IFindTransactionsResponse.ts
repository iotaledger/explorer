import { IFindTransactionsHint } from "./IFindTransactionsHint";

export interface IFindTransactionsResponse {
    /**
     * Error.
     */
    error?: string;

    /**
     * The hashes found.
     */
    hashes?: string[];

    /**
     * The milestone for the transactions.
     */
    milestones?: (number | null)[];

    /**
     * The value of the transactions.
     */
    values?: number[];

    /**
     * The timestamps of the transactions.
     */
    timestamps?: number[];

    /**
     * The additional hints.
     */
    hints?: IFindTransactionsHint[];
}
