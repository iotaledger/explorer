export interface IGetTrytesResponse {
  /**
   * Error.
   */
  error?: string;

  /**
   * The transaction trytes for the requested hash.
   */
  trytes: string;
}
