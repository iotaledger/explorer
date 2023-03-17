
export interface IFindTransactionsRequest {
    /**
     * The addresses to search for transactions.
     */
    addresses?: string[];

    /**
     * The tags to search for transactions.
     */
    tags?: string[];

    /**
     * The bundles to search for transactions.
     */
    bundles?: string[];

    /**
     * The approvees to search for transactions.
     */
    approvees?: string[];
}
