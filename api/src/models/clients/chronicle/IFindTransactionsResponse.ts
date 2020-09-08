import { IFindTransactionsHint } from "./IFindTransactionsHint";

export interface IFindTransactionsResponse {
    /**
     * The hashes found.
     */
    hashes?: string[];

    /**
     * Hints to use in next lookups.
     */
    hints?: IFindTransactionsHint[];

    /**
     * Error.
     */
    error?: string;
}
