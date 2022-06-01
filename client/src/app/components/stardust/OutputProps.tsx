import { OutputTypes } from "@iota/iota.js-stardust";

export interface OutputProps {
    /**
     * The output id.
     */
    id: string;

    /**
     * The index within the parent.
     */
    index: number;

    /**
     * The output to display.
     */
    output: OutputTypes;

    /**
     * The amount to display.
     */
    amount: number;

    /**
     * Should hide the label.
     */
    hideLabel?: boolean;

    /**
     * The network to lookup.
     */
    network: string;
}
