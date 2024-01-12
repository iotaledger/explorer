/**
 * The request for Transaction History on stardust.
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
     * The lower bound milestone index to use.
     */
    startMilestoneIndex?: number;

    /**
     * The cursor state for the request.
     */
    cursor?: string;
}

