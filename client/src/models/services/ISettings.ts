import { Unit } from "@iota/unit-converter";
import { ICurrencySettings } from "./ICurrencySettings";
import { ValueFilter } from "./valueFilter";

export interface ISettings extends ICurrencySettings {
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
     * Hide zero transactions.
     */
    showOnlyValueTransactions?: boolean;

    /**
     * Hide unconfirmed transactions.
     */
    showOnlyConfirmedTransactions?: boolean;

    /**
     * Format values in full.
     */
    formatFull?: boolean;

    /**
     * Display visualization in dark mode.
     */
    darkMode?: boolean;
}

export type SettingsKeys = keyof ISettings;
