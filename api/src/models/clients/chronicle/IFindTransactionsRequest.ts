export interface IFindTransactionsRequest {
    /**
     * The addresses to search for transactions.
     */
    addresses?: ReadonlyArray<string>;

    /**
     * The tags to search for transactions.
     */
    tags?: ReadonlyArray<string>;

    /**
     * The bundles to search for transactions.
     */
    bundles?: ReadonlyArray<string>;

    /**
     * The approvees to search for transactions.
     */
    approvees?: ReadonlyArray<string>;
}
