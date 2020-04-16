import { Unit } from "@iota/unit-converter";
import { ICurrencySettings } from "./ICurrencySettings";
import { IMapSettings } from "./IMapSettings";
import { ValueFilter } from "./valueFilter";

export interface ISettings extends ICurrencySettings, IMapSettings {
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

    /**
     * Map expanded.
     */
    isMapExpanded?: boolean;
}
