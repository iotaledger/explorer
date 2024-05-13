/**
 * The request for Transaction History on nova.
 */
export interface ITransactionHistoryRequest {
    /**
     * The network in context.
     */
    network: string;

    /**
     * The address to get the history for.
     */
    address: string;

    /**
     * The page size of the request (default is 100).
     */
    pageSize?: number;

    /**
     * The sort by date to use.
     */
    sort?: string;

    /**
     * The lower bound slot index to use.
     */
    startSlotIndex?: number;

    /**
     * The cursor state for the request.
     */
    cursor?: string;
}
