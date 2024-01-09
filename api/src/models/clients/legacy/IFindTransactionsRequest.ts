export interface IFindTransactionsRequest {
  /**
   * The address of the searched transactions.
   */
  address?: string;

  /**
   * The tag of the searched transactions.
   */
  tag?: string;

  /**
   * The bundle of the searched transactions.
   */
  bundle?: string;

  /**
   * The approvee of the searched transactions.
   */
  approvee?: string;

  /**
   * Max results to return.
   */
  maxresults: number;
}
