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
     * Toggle balance between raw and formatted amount.
     */
    toggleBalance: boolean;
}
