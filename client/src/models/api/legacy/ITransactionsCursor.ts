export interface ITransactionsCursor {
  /**
   * There are more transactions.
   */
  hasMore?: boolean;
  /**
   * What was the next index.
   */
  nextIndex?: number;
  /**
   * Count from plain node.
   */
  node?: number;
  /**
   * Count from perm anode.
   */
  perma?: number;
  /**
   * Perma node paging.
   */
  permaPaging?: string;
}
