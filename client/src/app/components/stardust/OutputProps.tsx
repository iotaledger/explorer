import { OutputTypes } from "@iota/iota.js-stardust";
import * as H from "history";

export interface OutputProps {
    /**
     * The network to lookup.
     */
     network: string;
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

    /**
     * History for navigation.
     */
    history: H.History;
}
