import { Unit } from "@iota/unit-converter";
import { ValueFilter } from "./valueFilter";

export interface IFilterSettings {
    /**
     * Value filter for feeds.
     */
    valueFilter?: ValueFilter;

    /**
     * Value limit feeds.
     */
    valueMinimum?: string;

    /**
     * Value limit units for feeds.
     */
    valueMinimumUnits?: Unit;

    /**
     * Value limit feeds.
     */
    valueMaximum?: string;

    /**
     * Value limit units for feeds.
     */
    valueMaximumUnits?: Unit;
}


