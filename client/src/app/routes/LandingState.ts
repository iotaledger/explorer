import { Unit } from "@iota/unit-converter";
import { ValueFilter } from "../../models/services/valueFilter";
import { CurrencyState } from "../components/CurrencyState";
import { FeedsState } from "../components/FeedsState";

export interface LandingState extends CurrencyState, FeedsState {
    /**
     * The market cap in eur.
     */
    marketCapEur: number;

    /**
     * The market cap in selected currency.
     */
    marketCapCurrency: string;

    /**
     * The price in EUR.
     */
    priceEur: number;

    /**
     * The price in selected currency.
     */
    priceCurrency: string;

    /**
     * Limit the transactions by value.
     */
    valueMinimum: string;

    /**
     * The unit type.
     */
    valueMinimumUnits: Unit;

    /**
     * Limit the transactions by value.
     */
    valueMaximum: string;

    /**
     * The unit type.
     */
    valueMaximumUnits: Unit;

    /**
     * Filter specific value types.
     */
    valueFilter: ValueFilter;
}
