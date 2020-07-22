/* eslint-disable camelcase */
export interface IFindTransactionsHint {
    /**
     * The month where the next transactions are available.
     */
    month?: number;

    /**
     * The year where the next transactions are available.
     */
    year?: number;

    /**
     * The page size of the response.
     */
    page_size?: number;

    /**
     * The paging state cursor.
     */
    paging_state?: number[];
}
