import { OutputTypes } from "@iota/iota.js-stardust";

export interface OutputProps {
    /**
     * The output id.
     */
    outputId: string;

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
     * The network to lookup.
     */
    network: string;
}
