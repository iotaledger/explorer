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
     * The values for the day graph.
     */
    dayPrices: {
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
    pricesRange?: {
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
     * The values for the graph.
     */
    volumes: {
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
     * The values for the graph.
     */
    dayVolumes: {
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
    volumesRange?: {
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
     * The market cap in selected currency.
     */
    marketCapCurrency: string;

    /**
     * The price in selected currency.
     */
    priceCurrency: string;

    /**
     * The price all time high.
     */
    priceAllTimeHigh: string;

    /**
     * The price all time low.
     */
    priceAllTimeLow: string;

    /**
     * The volume all time high.
     */
    volumeAllTimeHigh: string;

    /**
     * The volume all time low.
     */
    volumeAllTimeLow: string;
}
