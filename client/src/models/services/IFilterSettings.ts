import { Units } from "@iota/iota.js";
import { ValueFilter } from "./valueFilter";

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
    valueMinimumUnits?: Units;

    /**
     * Value limit feeds.
     */
    valueMaximum?: string;

    /**
     * Value limit units for feeds.
     */
    valueMaximumUnits?: Units;
}


