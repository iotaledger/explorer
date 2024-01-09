export interface TransactionPayloadState {
  /**
   * Shows details of the specified input id
   */
  showInputDetails: number;

  /**
   * Shows details of the specified output id
   */
  showOutputDetails: number;

  /**
   * Toggle input balance between raw and formatted amount.
   */
  isInputBalanceFormatted: number[];

  /**
   * Toggle output balance between raw and formatted amount.
   */
  isOutputBalanceFormatted: number[];
}
