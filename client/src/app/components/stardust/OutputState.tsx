import { OutputTypes } from "@iota/iota.js-stardust";

export interface OutputState {
    /**
     * The output.
     */
    output: OutputTypes;
    /**
     * Shows details of the native token.
     */
    showNativeToken: boolean;
    /**
     * Show output details.
     */
    isExpanded: boolean;
    /**
     * Toggle balance between raw and formatted amount.
     */
    isFormattedBalance: boolean;
}
