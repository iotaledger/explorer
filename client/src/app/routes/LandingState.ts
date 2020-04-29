import { Unit } from "@iota/unit-converter";
import { ValueFilter } from "../../models/services/valueFilter";
import { CurrencyState } from "../components/CurrencyState";

export interface LandingState extends CurrencyState {
    /**
     * The transactions per second.
     */
    transactionsPerSecond: string;

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

    /**
     * Latest transactions.
     */
    transactions: {
        /**
         * The tx hash.
         */
        hash: string;
        /**
         * The tx value.
         */
        value: number
    }[];

    /**
     * Latest milestones.
     */
    milestones: {
        /**
         * The transaction hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}
