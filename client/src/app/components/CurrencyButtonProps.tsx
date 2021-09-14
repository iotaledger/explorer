export interface CurrencyButtonProps {
    /**
     * The markets route.
     */
    marketsRoute?: string;
    /**
     * The value to display.
     */
    value?: number;
    /**
     * Only shows fiat dropdown menu to choose fiat currency.
     */
    onlyFiatSelect?: boolean;
    /**
     * Only shows simple fiat value.
     */
    simple?: boolean;
}
