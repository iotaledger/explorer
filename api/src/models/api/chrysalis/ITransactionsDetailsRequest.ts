/* eslint-disable camelcase */
export interface ITransactionsDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The address to get the details for.
     */
    address: string;

    /**
     * Requested page size.
     */
    page_size?: string;

    /**
     * The paging state, to be stored and re-used when retrieving additional records. Hex encoded.
     */
    state?: string;
}
