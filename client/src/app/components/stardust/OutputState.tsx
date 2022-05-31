import { OutputTypes } from "@iota/iota.js-stardust";

export interface OutputState {
    /**
     * The output.
     */
    output: OutputTypes;
    /**
     * The output id.
     */
    outputId: string;
    /**
     * Shows details of the specified output id
     */
    showOutputDetails: number;
}
