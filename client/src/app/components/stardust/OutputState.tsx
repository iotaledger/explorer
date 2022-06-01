import { OutputTypes } from "@iota/iota.js-stardust";

export interface OutputState {
    /**
     * The output.
     */
    output: OutputTypes;
    /**
     * Shows details of the specified output id
     */
    showOutputDetails: number;
}
