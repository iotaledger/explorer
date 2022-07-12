import { Units } from "@iota/iota.js";
import { INetwork } from "../../models/config/INetwork";
import { IFeedItem } from "../../models/feed/IFeedItem";
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
    valueMinimumUnits: Units;

    /**
     * Limit the transactions by value.
     */
    valueMaximum: string;

    /**
     * The unit type.
     */
    valueMaximumUnits: Units;

    /**
     * Filter specific value types.
     */
    valuesFilter: ValueFilter[];

    /**
     * Format the iota in full.
     */
    formatFull?: boolean;

    /**
     * Latest transactions.
     */
    filteredItems: IFeedItem[];

    /**
     * Is the messages feed paused.
     */
    isFeedPaused: boolean;

    /**
     * Is the filter of messages opened.
     */
    isFilterExpanded: boolean;

    /**
     * Messages snapshot when feed is paused.
     */
    frozenMessages: IFeedItem[];

    /**
     * The number of seconds passed since last milestone.
     */
    secondsSinceLastMilestone: number;
}
