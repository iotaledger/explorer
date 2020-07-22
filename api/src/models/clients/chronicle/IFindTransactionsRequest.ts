import { IFindTransactionsRequestHint } from "./IFindTransactionsRequestHint";

export interface IFindTransactionsRequest {
    /**
     * The addresses to search for transactions.
     */
    addresses?: readonly string[];

    /**
     * The tags to search for transactions.
     */
    tags?: readonly string[];

    /**
     * The bundles to search for transactions.
     */
    bundles?: readonly string[];

    /**
     * The approvees to search for transactions.
     */
    approvees?: readonly string[];

    /**
     * Hints to use in the lookup.
     */
    hints?: IFindTransactionsRequestHint[];
}
