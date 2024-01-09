export interface ISearchRequest {
  /**
   * The network to search on.
   */
  network: string;

  /**
   * The query to look for.
   */
  query: string;

  /**
   * A cursor to use if reading the next page of results.
   */
  cursor?: string;
}
