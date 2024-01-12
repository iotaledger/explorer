
import { ICurrencySettings } from "./ICurrencySettings";
import { IFilterSettings } from "./IFilterSettings";
import { IFilterSettings as IStardustFilterSettings } from "./stardust/IFilterSettings";

export interface ISettings extends ICurrencySettings {
    /**
     * Filter settings for each network.
     */
    filters?: {
        [network: string]: IFilterSettings | IStardustFilterSettings;
    };

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

    /**
     * Show the advanced display.
     */
    advancedMode?: boolean;
}

export type SettingsKeys = keyof ISettings;
