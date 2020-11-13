import { Unit } from "@iota/unit-converter";
import { INetwork } from "../../models/db/INetwork";
import { IFeedItem } from "../../models/IFeedItem";
import { ValueFilter } from "../../models/services/valueFilter";
import { CurrencyState } from "../components/CurrencyState";
import { FeedsState } from "../components/FeedsState";

export interface LandingState extends CurrencyState, FeedsState {
    /**
     * The name of the network.
     */
    networkConfig: INetwork;

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
     * Format the iota in full.
     */
    formatFull?: boolean;

    /**
     * Latest transactions.
     */
    filteredItems: IFeedItem[];
}
