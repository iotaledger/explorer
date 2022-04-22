import { OutputTypes } from "@iota/iota.js-stardust";

export interface NewOutputState {
    output: OutputTypes;
    /**
     * Shows details of the specified output id
     */
    showOutputDetails: number;
}
