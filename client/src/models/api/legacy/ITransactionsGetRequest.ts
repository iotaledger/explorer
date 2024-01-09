import { ITransactionsCursor } from "./ITransactionsCursor";
import { TransactionsGetMode } from "./transactionsGetMode";

export interface ITransactionsGetRequest {
  /**
   * The network to search on.
   */
  network: string;

  /**
   * The hash to look for.
   */
  hash: string;

  /**
   * The mode to look for transactions if known.
   */
  mode?: TransactionsGetMode;

  /**
   * Limit the number of items returned.
   */
  limit?: number;

  /**
   * Cursor for getting more items.
   */
  cursor?: ITransactionsCursor;
}
