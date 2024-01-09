import { ITransactionsCursor } from "./ITransactionsCursor";
import { TransactionsGetMode } from "./transactionsGetMode";
import { IResponse } from "../IResponse";

export interface ITransactionsGetResponse extends IResponse {
  /**
   * The items for the matching transaction.
   */
  txHashes?: string[];

  /**
   * The mode to look for transactions.
   */
  mode?: TransactionsGetMode;

  /**
   * Cursor for getting more items.
   */
  cursor?: ITransactionsCursor;
}
