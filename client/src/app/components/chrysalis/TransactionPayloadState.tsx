export interface TransactionPayloadState {
    /**
     * Format the curreny in full.
     */
    formatFull?: boolean;

    /**
     * Shows details of the specified input id
     */
    showInputDetails: number;

    /**
     * Shows details of the specified output id
     */
    showOutputDetails: number;
}
