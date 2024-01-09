import { Units } from "@iota/iota.js";

import { FilterField } from "./filterField";
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
