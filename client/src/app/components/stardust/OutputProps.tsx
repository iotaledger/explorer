import { OutputTypes } from "@iota/iota.js-stardust";

export interface OutputProps {
    /**
     * The output id.
     */
    id: string;

    /**
     * Index of an output.
     */
    outputIndex?: number;

    /**
     * The output to display.
     */
    output: OutputTypes;

    /**
     * The amount to display.
     */
    amount: number;

    /**
     * Show amount and copy button.
     */
    showCopyAmount: boolean;

    /**
     * Should hide the label.
     */
    hideLabel?: boolean;

    /**
     * The network to lookup.
     */
    network: string;
}
