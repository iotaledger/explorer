import { TangleStatus } from "~models/tangleStatus";

export interface TransactionState {
  /**
   * The number of inputs.
   */
  inputs?: number;
  /**
   * The number of outputs.
   */
  outputs?: number;
  /**
   * The total amount of the transaction.
   */
  amount: number;
  /**
   * The status of the message.
   */
  messageTangleStatus?: TangleStatus;
  /**
   * The date transaction is referenced by a milestone.
   */
  date?: string;
}
