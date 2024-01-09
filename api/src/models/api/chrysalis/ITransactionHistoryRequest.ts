/* eslint-disable camelcase */
export interface ITransactionHistoryRequest {
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
  pageSize?: string;
}
