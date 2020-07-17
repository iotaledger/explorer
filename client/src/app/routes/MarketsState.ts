import { CurrencyState } from "../components/CurrencyState";

export interface MarketsState extends CurrencyState {
    /**
     * Is the component busy.
     */
    statusBusy: boolean;

    /**
     * The values for the graph.
     */
    prices: {
        /**
         * Value to display.
         */
        x: number;
        /**
         * Value to display.
         */
        y: number;
    }[];

    /**
     * The range value for the graph.
     */
    range?: {
        /**
         * Value to display.
         */
        x: number;
        /**
         * Value to display.
         */
        y: number;
    }[];

    /**
     * The range to display.
     */
    selectedRange: string;

    /**
     * The ranges to display.
     */
    ranges: {
        /**
         * The value to use.
         */
        value: string;
        /**
         * The label to display.
         */
        label: string;
    }[];

    /**
     * The market cap in eur.
     */
    marketCapEUR: number;

    /**
     * The market cap in selected currency.
     */
    marketCapCurrency: string;

    /**
     * The price in EUR.
     */
    priceEUR: number;

    /**
     * The price in selected currency.
     */
    priceCurrency: string;
}
