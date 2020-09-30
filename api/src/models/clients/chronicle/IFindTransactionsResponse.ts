
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
    hints?: {
        /**
         * Address hint.
         */
        address?: string;

        /**
         * Timeline for additional hints.
         */
        timeline: {
            /**
             * The year of the additional data.
             */
            year: number;
            /**
             * The month of the additional data.
             */
            month: number;
        }[];

        /**
         * Paging state for subsequent requests.
         */
        // eslint-disable-next-line camelcase
        paging_state: number[];

        /**
         * The page size of the items.
         */
        // eslint-disable-next-line camelcase
        page_size: number | null;
    };
}
