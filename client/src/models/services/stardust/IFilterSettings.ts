import { Magnitudes } from "@iota/iota.js-stardust";
import { FilterField } from "../filterField";

export interface IFilterSettings {
    /**
     * Value filter for feeds.
     */
    valuesFilter?: FilterField[];

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


