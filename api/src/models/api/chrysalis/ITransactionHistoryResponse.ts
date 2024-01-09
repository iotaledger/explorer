import { IResponse } from "../IResponse";

interface ITransactionHistoryItem {
  /**
   * The hex encoded message ID of the message in which the transaction payload was included.
   */
  messageId: string;
  /**
   * The hex encoded transaction id.
   */
  transactionId: string;
  /**
   * The milestone index that references this message.
   */
  referencedByMilestoneIndex: number;
  /**
   * The milestone timestamp that references this message.
   */
  milestoneTimestampReferenced: number;
  /**
   * The ledger inclusion state of the transaction payload.
   */
  ledgerInclusionState: string;
  /**
   * The reason why this message is marked as conflicting.
   */
  conflictReason?: number;
  /**
   * The amount of inputs in the transaction payload.
   */
  inputsCount: number;
  /**
   * The amount of outputs in the transaction payload.
   */
  outputsCount: number;
  /**
   * The balance change of the address the history was queried for.
   */
  addressBalanceChange: number;
}

export interface ITransactionHistoryResponse extends IResponse {
  /**
   * The type for the address.
   */
  addressType?: number;
  /**
   * The address that the outputs are for.
   */
  address?: string;
  /**
   * The max number of results returned.
   */
  maxResults?: number;
  /**
   * The number of items returned.
   */
  count?: number;
  /**
   * The transaction history of this address.
   */
  history?: ITransactionHistoryItem[];
  /**
   * The ledger index at which the history was queried at.
   */
  ledgerIndex?: number;
}
