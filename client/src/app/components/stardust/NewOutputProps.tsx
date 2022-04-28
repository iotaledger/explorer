import { OutputTypes } from "@iota/iota.js-stardust";

export interface NewOutputProps {
    /**
     * The output id.
     */
    id?: string;

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
}
