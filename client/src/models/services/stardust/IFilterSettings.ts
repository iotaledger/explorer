import { Magnitudes } from "@iota/iota.js-stardust";
import { ValueFilter } from "../valueFilter";

export interface IFilterSettings {
    /**
     * Value filter for feeds.
     */
    valuesFilter?: ValueFilter[];

    /**
     * Value limit feeds.
     */
    valueMinimum?: string;

    /**
     * Value limit units for feeds.
     */
    valueMinimumMagnitude?: Magnitudes;

    /**
     * Value limit feeds.
     */
    valueMaximum?: string;

    /**
     * Value limit units for feeds.
     */
    valueMaximumMagnitude?: Magnitudes;
}


