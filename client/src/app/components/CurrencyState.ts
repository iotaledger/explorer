export interface CurrencyState {
    /**
     * The list of currencies.
     */
    currencies: string[];

    /**
     * The selected currency.
     */
    currency: string;

    /**
     * Format the iota in full.
     */
    formatFull: boolean;
}
